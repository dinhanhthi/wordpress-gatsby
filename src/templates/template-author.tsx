import { graphql } from 'gatsby'
import * as React from 'react'
import { SingleTaxonomyProps, TaxonomyPage } from '../layouts/taxonomy'

export default function AuthorPage(props: SingleTaxonomyProps) {
  return (
    <TaxonomyPage type="author" data={props.data} context={props.pageContext} />
  )
}

export const pageQuery = graphql`
  query WPAuthorPostsPaginated(
    $offset: Int
    $postsPerPage: Int
    $taxonomyUri: String
  ) {
    allWpPost(
      filter: { author: { node: { uri: { eq: $taxonomyUri } } } }
      sort: { fields: [date], order: DESC }
      limit: $postsPerPage
      skip: $offset
    ) {
      nodes {
        ...PostDetail
      }
    }
  }
`
