import * as React from 'react'
import { graphql } from 'gatsby'
import Page from '../layouts/page'

type IndividualPageProps = {
  data: Queries.IndividualPageByIdQuery
}

export default function IndividualPage(props: IndividualPageProps) {
  const wpPageData = props.data.wpPage
  return (
    <Page>
      <h1 className="text-2xl">This is {wpPageData?.title}</h1>
      {wpPageData?.pageCustomField?.subtitle && (
        <h2>{wpPageData?.pageCustomField.subtitle}</h2>
      )}
      {wpPageData?.content && (
        <div
          className="content mt-8"
          dangerouslySetInnerHTML={{ __html: wpPageData?.content }}
        />
      )}
    </Page>
  )
}

export const pageQuery = graphql`
  query IndividualPageById($id: String!) {
    wpPage(id: { eq: $id }) {
      id
      content
      title
      date(formatString: "DD/MM/YYYY")
      pageCustomField {
        subtitle
      }
      featuredImage {
        node {
          altText
          localFile {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: TRACED_SVG
                layout: FULL_WIDTH
              )
            }
          }
        }
      }
    }
  }
`
