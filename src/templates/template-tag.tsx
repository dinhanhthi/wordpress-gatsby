import { graphql } from 'gatsby'
import * as React from 'react'
import { SingleTaxonomyProps, TaxonomyPage } from '../layouts/taxonomy'

export default function TagPage(props: SingleTaxonomyProps) {
  return (
    <TaxonomyPage type="tag" data={props.data} context={props.pageContext} />
  )
}

export const pageQuery = graphql`
  query WPTagPostsPaginated(
    $offset: Int
    $postsPerPage: Int
    $taxonomyUri: String
  ) {
    allWpPost(
      filter: { tags: { nodes: { elemMatch: { uri: { eq: $taxonomyUri } } } } }
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
