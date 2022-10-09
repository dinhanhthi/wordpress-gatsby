import React from 'react'
import Page from './page'
import parse from 'html-react-parser'
import { graphql, Link } from 'gatsby'
import Pagination from '../components/pagination'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import { get } from 'lodash'

export type TaxonomyPageProps = {
  data: TaxonomyDataType
  context: TaxonomyContext
  type?: TaxonomyTypes
}

export type SingleTaxonomyProps = {
  data:
    | Queries.WPCategoryPostsPaginatedQuery
    | Queries.WPTagPostsPaginatedQuery
    | Queries.WPAuthorPostsPaginatedQuery
    | Queries.WPAllPostsPaginatedQuery
  pageContext: TaxonomyContext
}

type TaxonomyContext = {
  totalPages: number
  currentPage: number
  taxonomyUri: string
  taxonomyName?: string
  taxonomyDescription?: string
}

type TaxonomyDataType =
  | Queries.WPCategoryPostsPaginatedQuery
  | Queries.WPTagPostsPaginatedQuery
  | Queries.WPAuthorPostsPaginatedQuery

type TaxonomyTypes = 'category' | 'tag' | 'author'

export function TaxonomyPage(props: TaxonomyPageProps) {
  const { data, context, type } = props
  const posts = data.allWpPost.nodes
  const typeTitle =
    type === 'category'
      ? 'Chủ đề'
      : type === 'tag'
      ? 'Tag'
      : type === 'author'
      ? 'Tác giả'
      : null

  if (!posts.length) {
    return (
      <Page>
        {typeTitle && context.taxonomyName && (
          <h1>
            {typeTitle} {context.taxonomyName}
          </h1>
        )}
        <p>No posts found!</p>
      </Page>
    )
  }

  return (
    <Page>
      <div className="grid grid-cols-1">
        <div className="mb-10">
          {typeTitle && context.taxonomyName && (
            <h1 className="text-xl">
              {typeTitle} {context.taxonomyName}
            </h1>
          )}

          {context.taxonomyDescription && (
            <p>{parse(context.taxonomyDescription)}</p>
          )}
        </div>

        <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {posts.map((post: any) => {
            return (
              <div key={post.uri}>
                {get(post, 'featuredImage') && (
                  <GatsbyImage
                    image={
                      getImage(
                        get(post, 'featuredImage.node.localFile')
                      ) as IGatsbyImageData
                    }
                    alt={post.featuredImage?.node?.alt || 'Post cover'}
                  ></GatsbyImage>
                )}
                <h3>
                  <Link to={post.uri}>{parse(post.title)}</Link>
                </h3>
                <div>{post.excerpt && parse(post.excerpt)}</div>
              </div>
            )
          })}
        </div>

        <Pagination
          className="mt-8"
          path={context.taxonomyUri}
          total={context.totalPages}
          current={context.currentPage}
        />
      </div>
    </Page>
  )
}

export const postDetailFragment = graphql`
  fragment PostDetail on WpPost {
    excerpt
    uri
    date(formatString: "DD-MM-YY")
    title
    excerpt
    featuredImage {
      node {
        altText
        localFile {
          childImageSharp {
            gatsbyImageData(
              quality: 70
              placeholder: BLURRED
              layout: FULL_WIDTH
            )
          }
        }
      }
    }
  }
`
