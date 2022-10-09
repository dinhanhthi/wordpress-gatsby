import React, { useState, useEffect } from 'react'
import Footer from '../components/footer'
import Navigation from '../components/navigation'
import '../styles/main.scss'

export type SiteTheme = 'dark' | 'light'
type BaseProps = { children: React.ReactNode }
const defaultTheme: SiteTheme = 'light'

export default function Base(props: BaseProps) {
  const { children } = props
  const [theme, setTheme] = useState(defaultTheme)
  const onUpdateTheme = (theme: SiteTheme) => {
    if (theme === 'dark') {
      setThemeTo(setTheme, 'light')
    } else if (theme === 'light') {
      setThemeTo(setTheme, 'dark')
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as SiteTheme
    if (savedTheme) {
      setThemeTo(setTheme, savedTheme)
    } else {
      setThemeTo(setTheme, defaultTheme)
    }
  }, [])
  return (
    <div className="thi-bg thi-text-color">
      <Navigation
        theme={theme as SiteTheme}
        onUpdateTheme={() => onUpdateTheme(theme as SiteTheme)}
      />
      <main role="main" className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function setThemeTo(setTheme: any, theme: 'dark' | 'light') {
  localStorage.setItem('theme', theme)
  setTheme(theme)
  if (theme === 'dark') {
    document.body.classList.add('dark')
    document.body.classList.remove('light')
  } else {
    document.body.classList.remove('dark')
    document.body.classList.add('light')
  }
}
