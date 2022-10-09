import fetch from 'isomorphic-fetch'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: process.env.GATSBY_GRAPHQL_ENDPOINT_URL,
    fetch,
  }),
})

export default client
