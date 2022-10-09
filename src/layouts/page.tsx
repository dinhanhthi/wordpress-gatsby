import * as React from 'react'
import Base from './base'

type PageOptions = {
  bgClass?: string
}
type PageProps = {
  children: React.ReactNode
  options?: PageOptions
}

export default function Page(props: PageProps) {
  const { children, options } = props
  return (
    <Base>
      <div className={options?.bgClass ? options.bgClass : ''}>
        <div className="container mx-auto px-4">{children}</div>
      </div>
    </Base>
  )
}
