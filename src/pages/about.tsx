import * as React from 'react'
import { Link } from 'gatsby'
import Page from '../layouts/page'

export default function AboutPage() {
  return (
    <Page>
      <h1 className="text-2xl">This is About Page (created manually)</h1>
      <Link to="/">Go back to the homepage</Link>
    </Page>
  )
}
