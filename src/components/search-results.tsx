import React from 'react'
import { Link } from 'gatsby'
import { useQuery, gql } from '@apollo/client'

/**
 * Since the query below is only available in the WP admin's GraphiQL,
 * there will be an error in the "posts" field! Eslint uses the keyword "gql"
 * to specify the type of the query, so we change it to "gqlIgnoreError" to
 * ignore the error.
 */
const gqlIgnoreError = gql
const GET_RESULTS = gqlIgnoreError`
  query WPPostsSearch($searchTerm: String) {
    posts(where: { search: $searchTerm }) {
      edges {
        node {
          id
          uri
          title
          excerpt
        }
      }
    }
  }
`

type SearchResultsProps = {
  searchTerm: string
}

export default function SearchResults(props: SearchResultsProps) {
  const { data, loading, error } = useQuery(GET_RESULTS, {
    variables: { searchTerm: props.searchTerm },
  })
  if (loading) return <p>Searching posts for {props.searchTerm}...</p>
  if (error) return <p>Error - {error.message}</p>
  return (
    <section className="search-results">
      <h2 className="text-2xl mb-4">
        Found {data.posts.edges.length} results for "{props.searchTerm}":
      </h2>
      <ol className="list-decimal pl-5 mb-6">
        {data.posts.edges.map((el: any) => {
          return (
            <li key={el.node.id}>
              <Link to={el.node.uri}>{el.node.title}</Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
