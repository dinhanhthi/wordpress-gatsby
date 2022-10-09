import { graphql } from 'gatsby'
import * as React from 'react'
import { TaxonomyPage, SingleTaxonomyProps } from '../layouts/taxonomy'

export default function CategoryPage(props: SingleTaxonomyProps) {
  return (
    <TaxonomyPage
      type="category"
      data={props.data}
      context={props.pageContext}
    />
  )
}

export const pageQuery = graphql`
  query WPCategoryPostsPaginated(
    $offset: Int
    $postsPerPage: Int
    $taxonomyUri: String
  ) {
    allWpPost(
      filter: {
        categories: { nodes: { elemMatch: { uri: { eq: $taxonomyUri } } } }
      }
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
