import * as React from 'react'
import { Link, graphql } from 'gatsby'
import Base from '../layouts/base'
import { GatsbyImage } from 'gatsby-plugin-image'
import parse from 'html-react-parser'
import { get } from 'lodash'
import LazyloadImage from '../components/lazy-load-image'

type SinglePostProps = {
  data: Queries.BlogPostByIdQuery
}

export default function PostTemplate(props: SinglePostProps) {
  const { previous, next, post } = props.data
  const featuredImage = {
    data: post?.featuredImage?.node?.localFile?.childImageSharp
      ?.gatsbyImageData,
    alt: post?.featuredImage?.node?.altText ?? 'This image has no alt text',
  }

  return (
    <Base>
      <article className="prose">
        <header>
          <h1>{parse(post?.title ?? 'No title')}</h1>

          <p>{post?.date}</p>

          <h2 className="text-xl">TOC</h2>
          {get(post, 'toc.items.length') > 3 && (
            <ul>
              {get(post, 'toc.items').map((item: any) => (
                <li key={item.url}>
                  <a href={item.url}>{item.title}</a>
                </li>
              ))}
            </ul>
          )}

          <h2 className="text-xl">Related posts</h2>
          <ul className="mb-6">
            {post?.relatedPosts?.nodes?.map(el => {
              return (
                <li key={el?.id as string}>
                  <Link to={el?.uri as string}>{el?.title}</Link>
                </li>
              )
            })}
          </ul>

          {featuredImage?.data && (
            <GatsbyImage
              image={featuredImage.data}
              alt={featuredImage.alt}
              style={{ marginBottom: 50 }}
            />
          )}
        </header>

        {!!post?.content && (
          <section>
            {parse(
              post.content
                // .replaceAll('<tpink>', '<span class="tpink">')
                .replaceAll('<tpink>', '<Link to="/about">')
                // .replaceAll('</tpink>', '</span>')
                .replaceAll('</tpink>', '<Link/>')
                .replaceAll('<tgreen>', '<span class="tgreen">')
                .replaceAll('</tgreen>', '</span>')
                .replaceAll('<bbt>', '<span class="bbt">')
                .replaceAll('</bbt>', '</span>')
                .replaceAll('<kbd>', '<span class="kbd">')
                .replaceAll('</kbd>', '</span>'),
              { replace: replaceMedia }
            )}
          </section>
        )}

        <hr />

        <footer>This is a footer!</footer>
      </article>

      <nav>
        <ul>
          <li>
            {previous && (
              <Link to={previous.uri as string} rel="prev">
                ← {parse(previous.title as string)}
              </Link>
            )}
          </li>

          <li>
            {next && (
              <Link to={next.uri as string} rel="next">
                {parse(next.title as string)} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Base>
  )
}

const getImage = (node: any) => {
  if (node.name === 'img') {
    return node
  } else if (node.children != null) {
    for (let index = 0; index < node.children.length; index++) {
      const image = getImage(node.children[index]) as any
      if (image != null) return image
    }
  }
}

const replaceMedia = (node: any) => {
  if (node.name === 'figure' && doesNodeContainsTag(node, 'img') !== -1) {
    const figureClasses = node.attribs.class
    const image = getImage(node)
    const figCaption =
      doesNodeContainsTag(node, 'figcaption') !== -1
        ? node.children[doesNodeContainsTag(node, 'figcaption')].children[0]
            .data
        : null
    if (image != null) {
      return (
        <figure className={figureClasses}>
          <LazyloadImage src={image.attribs.src} alt={image.attribs.alt} />
          {figCaption && <figcaption>{figCaption}</figcaption>}
        </figure>
      )
    }
    return node
  }
}

function doesNodeContainsTag(node: any, tag: string): number {
  if (node.children != null) {
    for (let index = 0; index < node.children.length; index++) {
      if (node.children[index].name === tag) {
        return index
      }
    }
  }
  return -1
}

export const pageQuery = graphql`
  query BlogPostById(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    post: wpPost(id: { eq: $id }) {
      id
      excerpt
      content
      title
      date(formatString: "DD/MM/YYYY")
      relatedPosts {
        nodes {
          title
          uri
          id
        }
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
      toc
    }
    previous: wpPost(id: { eq: $previousPostId }) {
      uri
      title
    }
    next: wpPost(id: { eq: $nextPostId }) {
      uri
      title
    }
  }
`
