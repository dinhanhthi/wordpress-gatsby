import type { Actions, CreatePagesArgs, GatsbyNode, Reporter } from 'gatsby'
import { chunk, get } from 'lodash'
import path from 'path'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + `/.env.${process.env.NODE_ENV}` })

type GatsbyNodePosts = Queries.GatsbyNodeWpPostsQuery['allWpPost']['edges']
type GatsbyNodePages = Queries.GatsbyNodeWpPagesQuery['allWpPage']['nodes']
type GatsbyNodeCategoryData = Queries.WpCatPostsQuery
type GatsbyNodeTagData = Queries.WpTagPostsQuery
type GatsbyNodeAuthorData = Queries.WpAuthorPostsQuery
type GatsbyNodeTaxnomyData =
  | GatsbyNodeCategoryData
  | GatsbyNodeTagData
  | GatsbyNodeAuthorData
type GatsbyUtilities = {
  actions: Actions
  graphql: CreatePagesArgs['graphql']
  reporter: Reporter
}

/* RELATED CUSTOM SCHEMA */
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async ({ actions }) => {
    const { createTypes, createFieldExtension } = actions

    /* Related posts */
    const typeDefs = `
    type WpPost implements Node {
      relatedPosts: WpNodePost!
    }

    type WpNodePost implements Node {
      nodes: [WpPost]
    }
  `
    createTypes(typeDefs)

    /* TOC */
    createFieldExtension({
      name: 'content',
      extend: extendContentField,
    })
    const typeDefs2 = `
    type WpPost implements Node {
      toc: JSON
      content: String @content
    }
  `
    createTypes(typeDefs2)
  }

export const createResolvers: GatsbyNode['createResolvers'] = async ({
  createResolvers,
}) =>
  createResolvers({
    WpPost: {
      relatedPosts: {
        resolve: async (source: any, _args: any, context: any, _info: any) => {
          const { databaseId } = source
          const response = await fetch(
            `${process.env.WORDPRESS_BASE}/wp-json/yarpp/v1/related/${databaseId}?limit=5`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json, text/plain, */*',
                'User-Agent': '*',
              },
            }
          ).then(async res => (res.status === 200 ? await res.json() : []))
          if (response && response.length) {
            const { entries } = await context.nodeModel.findAll({
              query: {
                filter: {
                  databaseId: { in: response.map(({ id }: { id: any }) => id) },
                },
              },
              type: 'WpPost',
            })
            return { nodes: entries }
          } else return { nodes: [] }
        },
      },
      toc: {
        resolve: createTableOfContents,
      },
    },
  })

function extendContentField(_options: any, _prevFieldConfig: any) {
  return {
    resolve(source: any) {
      const content = source?.content || ''
      if (content === '') console.log('👹👹👹 Empty content')
      const $ = cheerio.load(content)
      const titles = $('h2,h3,h4,h5')
      const getUniqueId = UniqueId()
      Array.from(titles).forEach(title => {
        const id = createId($, title)
        $(title).attr('id', getUniqueId(id))
      })

      return $('body').html()
    },
  }
}

async function createTableOfContents(source: any) {
  const content = source?.content || ''
  if (content === '') console.log('👹👹👹 Empty content')
  const $ = cheerio.load(content)
  const titles = $('h2,h3,h4,h5')
  const getUniqueId = UniqueId()

  const headings = Array.from(titles).map(title => {
    const depth = parseInt($(title).prop('tagName').substr(1), 10)
    const id = createId($, title)
    return { url: `#${getUniqueId(id)}`, title: $(title).text(), depth }
  })

  const reduced = groupHeadings(0, [], headings)
  return { items: reduced }
}

function createId($: any, title: any) {
  let id = $(title).attr('id')

  if (!id) {
    id = $(title)
      .text()
      .toLowerCase()
      .replace(/[^a-z_0-9]+/gi, '-')
      .replace(/-+/g, '-')
  }

  return id
}

function UniqueId() {
  const tempMap = {} as any
  return (el: any) => {
    if (tempMap[el]) {
      tempMap[el] = tempMap[el] + 1
      const result = `${el}-${tempMap[el]}`
      tempMap[result] = 1
      return result
    } else {
      tempMap[el] = 1
      return el
    }
  }
}

function groupHeadings(index: any, grouping: any, headings: any): any {
  if (index < headings.length) {
    const nextHeading = headings[index]

    if (grouping.length) {
      const prevHeading = grouping.slice().pop()

      try {
        if (nextHeading.depth > prevHeading.depth) {
          prevHeading.items = prevHeading.items || []
          return groupHeadings(index, prevHeading.items, headings)
        } else if (nextHeading.depth === prevHeading.depth) {
          grouping.push({ ...nextHeading })
          return groupHeadings(++index, grouping, headings)
        } else {
          // eslint-disable-next-line no-throw-literal
          throw { index: index, heading: nextHeading }
        }
      } catch (higherHeading: any) {
        if (higherHeading.heading.depth === prevHeading.depth) {
          grouping.push({ ...higherHeading.heading })
          return groupHeadings(++higherHeading.index, grouping, headings)
        } else {
          throw higherHeading
        }
      }
    } else {
      grouping.push({ ...nextHeading })
      groupHeadings(++index, grouping, headings)
    }
  }

  return grouping
}

/* END OF CUSTOM SCHEMA */

export const createPages: GatsbyNode['createPages'] = async ({
  actions,
  graphql,
  reporter,
}) => {
  const gatsbyUtilities: GatsbyUtilities = { actions, graphql, reporter }

  // posts
  const posts: GatsbyNodePosts = await getPosts(gatsbyUtilities)
  if (posts.length) {
    await createIndividualPostPages(gatsbyUtilities, posts)

    // all posts
    await createAllPostsPage(gatsbyUtilities, posts)
  }

  // pages
  const pages: GatsbyNodePages = await getPages(gatsbyUtilities)
  if (pages.length) {
    await createIndividualPages(gatsbyUtilities, pages)
  }

  // category
  const categoryData = await getCategoryData(gatsbyUtilities)
  if (
    !categoryData.allWpCategory.nodes.length ||
    !categoryData.allWpPost.group.length
  ) {
    return
  }
  await createTaxonomyPage(categoryData, gatsbyUtilities, 'category')

  // tag
  const tagData = await getTagData(gatsbyUtilities)
  if (!tagData.allWpTag.nodes.length || !tagData.allWpPost.group.length) {
    return
  }
  await createTaxonomyPage(tagData, gatsbyUtilities, 'tag')

  // author
  const authorData = await getAuthorData(gatsbyUtilities)
  if (
    !authorData.allWpUser.nodes.length ||
    !authorData.allWpPost.group.length
  ) {
    return
  }
  await createTaxonomyPage(authorData, gatsbyUtilities, 'author')
}

async function createAllPostsPage(
  gatsbyUtilities: GatsbyUtilities,
  posts: GatsbyNodePosts
) {
  const graphqlResult = await gatsbyUtilities.graphql(/* GraphQL */ `
    {
      wp {
        readingSettings {
          postsPerPage
        }
      }
    }
  `)

  const { postsPerPage } = (graphqlResult.data as any).wp.readingSettings
  const postsChunkedIntoArchivePages = chunk(posts, postsPerPage)
  const totalPages = postsChunkedIntoArchivePages.length
  return Promise.all(
    postsChunkedIntoArchivePages.map(async (_posts, index) => {
      const pageNumber: number = index + 1
      const getPagePath = (page: any) => {
        if (page > 0 && page <= totalPages) {
          return page === 1 ? '/all/' : `/all/page/${page}/`
        }
        return null
      }

      return await gatsbyUtilities.actions.createPage({
        path: getPagePath(pageNumber) as string,
        component: path.resolve('./src/templates/template-all.tsx'),
        context: {
          offset: index * postsPerPage,
          postsPerPage,
          taxonomyUri: '/all/',
          totalPages: totalPages,
          currentPage: pageNumber,
        },
      })
    })
  )
}

async function getPosts(
  gatsbyUtilities: GatsbyUtilities
): Promise<GatsbyNodePosts> {
  const { graphql, reporter } = gatsbyUtilities
  const graphqlResult = await graphql(/* GraphQL */ `
    query GatsbyNodeWpPosts {
      allWpPost(sort: { fields: [date], order: DESC }) {
        edges {
          previous {
            id
          }
          post: node {
            id
            uri
          }
          next {
            id
          }
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts',
      graphqlResult.errors
    )
  }

  return (graphqlResult.data as Queries.GatsbyNodeWpPostsQuery).allWpPost.edges
}

const createIndividualPostPages = async (
  gatsbyUtilities: GatsbyUtilities,
  posts: GatsbyNodePosts
) =>
  Promise.all(
    posts.map((edge: GatsbyNodePosts[number]) =>
      gatsbyUtilities.actions.createPage({
        path: edge.post.uri as string,
        component: path.resolve('./src/templates/template-post.tsx'),
        context: {
          id: edge.post.id,
          previousPostId: edge.previous ? edge.previous.id : null,
          nextPostId: edge.next ? edge.next.id : null,
        },
      })
    )
  )

async function getPages(
  gatsbyUtilities: GatsbyUtilities
): Promise<GatsbyNodePages> {
  const { graphql, reporter } = gatsbyUtilities
  const graphqlResult = await graphql(/* GraphQL */ `
    query GatsbyNodeWpPages {
      allWpPage(
        sort: { fields: [date], order: DESC }
        filter: { pageCustomField: { createdifferent: { ne: true } } }
      ) {
        nodes {
          id
          uri
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts',
      graphqlResult.errors
    )
  }

  return (graphqlResult.data as Queries.GatsbyNodeWpPagesQuery).allWpPage.nodes
}

const createIndividualPages = async (
  gatsbyUtilities: GatsbyUtilities,
  pages: GatsbyNodePages
) =>
  Promise.all(
    pages.map((node: GatsbyNodePages[number]) =>
      gatsbyUtilities.actions.createPage({
        path: node.uri as string,
        component: path.resolve('./src/templates/template-page.tsx'),
        context: {
          id: node.id,
        },
      })
    )
  )

async function createTaxonomyPage(
  taxonomyData: GatsbyNodeTaxnomyData,
  gatsbyUtilities: GatsbyUtilities,
  type = 'category'
) {
  const graphqlResult = await gatsbyUtilities.graphql(/* GraphQL */ `
    {
      wp {
        readingSettings {
          postsPerPage
        }
      }
    }
  `)
  const { postsPerPage } = (graphqlResult.data as any).wp.readingSettings

  const taxonomyNodes =
    type === 'category'
      ? (taxonomyData as GatsbyNodeCategoryData).allWpCategory.nodes
      : type === 'tag'
      ? (taxonomyData as GatsbyNodeTagData).allWpTag.nodes
      : type === 'author'
      ? (taxonomyData as GatsbyNodeAuthorData).allWpUser.nodes
      : []
  const _groups = taxonomyData.allWpPost.group
  const taxonomies = taxonomyNodes
    .map((node: any) => ({
      ...node,
      ..._groups.find((g: any) => g.fieldValue === node.id),
    }))
    // .map((node: any) => (node.totalCount ? node : { ...node, totalCount: 0 })) // Including 0 posts taxonomies
    .filter((node: any) => node.totalCount) // Only taxonomies with posts
  // Info: Each category contains { fieldValue, id, name, uri, totalCount, description, categoryCustomField.mainColor  }

  const taxonomyTemplate =
    type === 'category'
      ? path.resolve('./src/templates/template-category.tsx')
      : type === 'tag'
      ? path.resolve('./src/templates/template-tag.tsx')
      : type === 'author'
      ? path.resolve('./src/templates/template-author.tsx')
      : null

  return Promise.all(
    taxonomies.map(async (taxonomy: any) => {
      const taxonomyName = taxonomy.name
      const taxonomyDescription = get(taxonomy, 'description')
      const taxonomyUri = taxonomy.uri
      const taxonomyNumberOfPosts = taxonomy.totalCount
      const totalPages = Math.ceil(taxonomyNumberOfPosts / postsPerPage)

      // // Update safelist.txt
      // if (type === 'category') {
      //   const taxonomyColor = get(taxonomy, 'categoryCustomField.mainColor')
      //   if (taxonomyColor) updateColorSafelist(`bg-[${taxonomyColor}]`)
      // }

      const subPromises = []

      for (let i = 0; i < totalPages; i++) {
        const pageNumber = i + 1
        const getPagePath = (page: any, taxUri: string) => {
          if (page > 0 && page <= totalPages) {
            return page === 1 ? taxUri : `${taxUri}page/${page}/`
          }
          return null
        }
        subPromises.push(
          gatsbyUtilities.actions.createPage({
            path: getPagePath(pageNumber, taxonomyUri) as string,
            component: taxonomyTemplate as string,
            context: {
              offset: i * postsPerPage,
              postsPerPage,
              taxonomyUri: taxonomyUri,
              taxonomyName: taxonomyName,
              taxonomyDescription: taxonomyDescription,
              totalPages: totalPages,
              currentPage: pageNumber,
            },
          })
        )
      }

      return await Promise.all(subPromises)
    })
  )
}

async function getCategoryData(
  gatsbyUtilities: GatsbyUtilities
): Promise<GatsbyNodeCategoryData> {
  const { graphql, reporter } = gatsbyUtilities
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpCatPosts {
      allWpPost(sort: { fields: date, order: DESC }) {
        group(field: categories___nodes___id) {
          fieldValue
          totalCount
        }
      }
      allWpCategory {
        nodes {
          id
          uri
          name
          description
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts by category',
      graphqlResult.errors
    )
  }

  return graphqlResult.data as GatsbyNodeCategoryData
}

async function getTagData(
  gatsbyUtilities: GatsbyUtilities
): Promise<GatsbyNodeTagData> {
  const { graphql, reporter } = gatsbyUtilities
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpTagPosts {
      allWpPost(sort: { fields: date, order: DESC }) {
        group(field: tags___nodes___id) {
          fieldValue
          totalCount
        }
      }
      allWpTag {
        nodes {
          id
          name
          description
          uri
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts by tag',
      graphqlResult.errors
    )
  }

  return graphqlResult.data as GatsbyNodeTagData
}

async function getAuthorData(
  gatsbyUtilities: GatsbyUtilities
): Promise<GatsbyNodeAuthorData> {
  const { graphql, reporter } = gatsbyUtilities
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpAuthorPosts {
      allWpPost(sort: { fields: date, order: DESC }) {
        group(field: author___node___id) {
          fieldValue
          totalCount
        }
      }
      allWpUser {
        nodes {
          id
          name
          uri
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts by author',
      graphqlResult.errors
    )
  }

  return graphqlResult.data as GatsbyNodeAuthorData
}
