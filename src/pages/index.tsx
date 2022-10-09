import * as React from 'react'
import { graphql, Link } from 'gatsby'
import parse from 'html-react-parser'

import '../styles/main.scss'
import Base from '../layouts/base'
import { gql, useQuery } from '@apollo/client'

export default function IndexPage({
  data,
}: {
  data: Queries.WPPostsIndexQuery
}) {
  const posts = data.listPosts.nodes

  // Popular posts
  const gqlIgnoreError = gql
  const GET_RESULTS = gqlIgnoreError`
    query WpPostsPopular {
      popularPosts(first: 10) {
        nodes {
          id
          title
          uri
        }
      }
    }
  `
  const { data: apolloData, loading, error } = useQuery(GET_RESULTS)
  if (error) return <p>Error - {error.message}</p>

  return (
    <Base>
      <div className="p-4">
        <h1 className="text-2xl mb-4">Testing in index</h1>

        <h2 className="text-xl">Popular posts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="mb-6 list-disc pl-5">
            {apolloData.popularPosts.nodes.map((el: any) => {
              return (
                <li key={el.id}>
                  <Link to={el.uri}>{el.title}</Link>
                </li>
              )
            })}
          </ul>
        )}

        {/* Category */}
        <h2 className="text-xl">
          List of {data.allNonEmptyCategories.totalCount} "non-empty" categories
        </h2>
        <div className="mb-6">
          {data.allNonEmptyCategories.nodes.map((category, i, arr) => {
            const numPosts = category.count ? category.count : 0
            if (arr.length - 1 === i) {
              return (
                <span key={category.uri}>
                  <Link to={`${category.uri}`}>
                    {category.name} ({numPosts})
                  </Link>
                  .
                </span>
              )
            }
            return (
              <span key={category.uri}>
                <Link to={`${category.uri}`}>
                  {category.name} ({numPosts})
                </Link>
                {' | '}
              </span>
            )
          })}
        </div>

        {/* Tag */}
        <h2 className="text-xl">
          List of {data.allNonEmptyTags.totalCount} "non-empty" tags
        </h2>
        <div className="mb-6">
          {data.allNonEmptyTags.nodes.map((tag, i, arr) => {
            const numPosts = tag.count ? tag.count : 0
            if (arr.length - 1 === i) {
              return (
                <span key={tag.uri}>
                  <Link to={tag.uri as string}>
                    {tag.name} ({numPosts})
                  </Link>
                  .
                </span>
              )
            } else {
              return (
                <span key={tag.uri}>
                  <Link to={tag.uri as string}>
                    {tag.name} ({numPosts})
                  </Link>
                  {' | '}
                </span>
              )
            }
          })}
        </div>

        {/* Latest posts */}
        <h2 className="text-xl">
          Last <strong>{posts.length}</strong> posts (
          <Link to="/all/">see all</Link>)
        </h2>
        <ol className="list-decimal pl-4 mb-6">
          {posts.map(post => {
            const title = post.title
            return (
              <li key={post.uri}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header>
                    <div>
                      <Link to={post.uri as string} itemProp="url">
                        <span itemProp="headline">
                          {parse(title as string)}
                        </span>
                      </Link>
                    </div>
                    <small>{post.date}</small>
                  </header>
                  <section itemProp="description">
                    {parse(post.excerpt ?? '')}
                  </section>
                </article>
              </li>
            )
          })}
        </ol>

        {/* Author */}
        <h2 className="text-xl">List of {data.allWpUser.totalCount} authors</h2>
        <ul className="list-disc pl-5 mb-6">
          {data.allWpUser.nodes.map(author => {
            return (
              <li key={author.uri}>
                <Link to={author.uri as string}>{author.name}</Link>
              </li>
            )
          })}
        </ul>

        {/* Page */}
        <h2 className="text-xl">List of {data.allWpPage.totalCount} pages</h2>
        <ul className="list-disc pl-5 mb-6">
          {data.allWpPage.nodes.map(page => {
            return (
              <li key={page.uri}>
                <Link to={page.uri as string}>{page.title}</Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Base>
  )
}

export const pageQuery = graphql`
  query WPPostsIndex {
    allNonEmptyCategories: allWpCategory(filter: { count: { gt: 0 } }) {
      nodes {
        name
        uri
        count
      }
      totalCount
    }
    allNonEmptyTags: allWpTag(filter: { count: { gt: 0 } }) {
      nodes {
        name
        uri
        count
      }
      totalCount
    }
    allWpUser {
      nodes {
        uri
        name
      }
      totalCount
    }
    listPosts: allWpPost(sort: { fields: [date], order: DESC }, limit: 5) {
      nodes {
        excerpt
        uri
        date(formatString: "MMMM DD, YYYY")
        title
      }
    }
    allWpPage {
      nodes {
        uri
        title
      }
      totalCount
    }
  }
`
