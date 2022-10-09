import * as React from 'react'

const Footer = () => {
  return (
    <div className="p-4">
      <footer
        style={{
          marginTop: '2rem',
        }}
      >
        © {new Date().getFullYear()}, Built with{' '}
        <a href="https://texmath.local">Gatsby</a>
      </footer>
    </div>
  )
}

export default Footer
