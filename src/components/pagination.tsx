import * as React from 'react'
import { Link } from 'gatsby'

type PaginationProps = {
  path: string
  total: number
  current: number
  className?: string
}

export default function Pagination(props: PaginationProps) {
  const { path, total, current, className } = props
  return (
    <div className={`${className ? className : ''}`}>
      <span className="mr-2">Pagination:</span>
      {current > 3 && (
        <span className="mr-2">
          <Link to={path}>First</Link>
        </span>
      )}

      {current > 1 && (
        <span className="mr-2">
          <Link to={getPagePath(current - 1, path)}>
            <i className="fontello-icon icon-left-open"></i>
          </Link>
        </span>
      )}

      {current > 2 && (
        <span className="mr-2">
          <Link to={getPagePath(current - 2, path)}>{current - 2}</Link>
        </span>
      )}

      {current > 1 && (
        <span className="mr-2">
          <Link to={getPagePath(current - 1, path)}>{current - 1}</Link>
        </span>
      )}

      {<span className="mr-2 font-bold">{current}</span>}

      {total - current > 0 && (
        <span className="mr-2">
          <Link to={getPagePath(current + 1, path)}>{current + 1}</Link>
        </span>
      )}

      {total - current > 1 && (
        <span className="mr-2">
          <Link to={getPagePath(current + 2, path)}>{current + 2}</Link>
        </span>
      )}

      {total - current > 0 && (
        <span className="mr-2">
          <Link to={getPagePath(current + 1, path)}>
            <i className="fontello-icon icon-right-open"></i>
          </Link>
        </span>
      )}

      {total - current > 2 && (
        <span>
          <Link to={getPagePath(total, path)}>Last</Link>
        </span>
      )}
    </div>
  )
}

const getPagePath = (pageNumber: number, taxUri: string) =>
  pageNumber === 1 ? taxUri : `${taxUri}page/${pageNumber}/`
