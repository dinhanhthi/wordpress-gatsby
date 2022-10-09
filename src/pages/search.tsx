import React from 'react'
import SearchResults from '../components/search-results'
import Page from '../layouts/page'

export default function SearchPage() {
  const isBrowser = () => typeof window !== 'undefined'
  let query = ''
  if (isBrowser()) {
    const { search } = window.location
    query = new URLSearchParams(search).get('s') as string
  }
  const finalSearchTerm = decodeURI(query as string)
  return (
    <Page>
      <div className="p-8">
        {finalSearchTerm && <SearchResults searchTerm={finalSearchTerm} />}
      </div>
    </Page>
  )
}
