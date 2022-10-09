import { graphql } from 'gatsby'
import * as React from 'react'
import { SingleTaxonomyProps, TaxonomyPage } from '../layouts/taxonomy'

export default function AllPostsPage(props: SingleTaxonomyProps) {
  return <TaxonomyPage data={props.data} context={props.pageContext} />
}

export const pageQuery = graphql`
  query WPAllPostsPaginated($offset: Int, $postsPerPage: Int) {
    allWpPost(
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
