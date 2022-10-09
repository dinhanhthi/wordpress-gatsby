import React, { MouseEventHandler, useRef, useState } from 'react'
import { graphql, Link, navigate, useStaticQuery } from 'gatsby'
import { Disclosure } from '@headlessui/react'
// import Tippy from '@tippyjs/react'
import cntl from 'cntl'

import { SiteTheme } from '../layouts/base'

import { MdOutlineCloseFullscreen } from 'react-icons/md'
import { FaHamburger } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
// import { RiMoonFill, RiSunFill } from 'react-icons/ri'
import Avatar from '../images/math2it.png'

const navClasses =
  'bg-nav-dark-bg shadow-transparent text-slate-700 text-gray-300'
const textClass = 'md:hover:text-white md:hover:bg-gray-700'
const iconSizeClass = 'w-6 h-6'
const groupSpaceClass = 'ml-2 md:ml-4'

type NavigationProps = {
  theme: SiteTheme
  onUpdateTheme: MouseEventHandler<HTMLButtonElement>
}

export default function Navigation(props: NavigationProps) {
  // const { theme, onUpdateTheme } = props
  const data: Queries.TypeGenWpMenuQuery = useStaticQuery(graphql`
    query TypeGenWpMenu {
      wpMenu(name: { eq: "indexMenu" }) {
        menuItems {
          nodes {
            id
            url
            label
            navigationItems {
              navColor
              navIcon
            }
          }
        }
      }
    }
  `)

  const menuItems = data?.wpMenu?.menuItems?.nodes

  const [valueSearch, setValueSearch] = useState('')
  const searchInput = useRef(null)

  return (
    <div className={`fixed top-0 left-0 z-50 w-full ${navClasses}`}>
      <div className="container mx-auto flex flex-wrap items-center justify-items-stretch">
        <Disclosure as="nav" className="w-full">
          {({ open }) => (
            <>
              <div className="mx-auto px-2">
                <div
                  className={'relative flex items-center justify-between h-14'}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                    {/* Mobile hamberger buttons*/}
                    <Disclosure.Button
                      className={`
                        fixed bottom-3 left-3 inline-flex items-center justify-center
                        rounded-full bg-gray-700 p-2 text-white ${textClass} shadow-md
                      `}
                    >
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <MdOutlineCloseFullscreen
                          className={`block ${iconSizeClass}`}
                          aria-hidden="true"
                        />
                      ) : (
                        <FaHamburger
                          className={`block ${iconSizeClass}`}
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>

                  <div className="flex flex-1 items-center justify-center md:justify-start">
                    <div className="flex flex-shrink-0 items-center rounded-full overflow-hidden">
                      <Link to="/" className="block h-10 w-auto">
                        <img
                          src={Avatar}
                          alt="Thi's avatar"
                          className="h-full"
                          width="auto"
                        />
                      </Link>
                    </div>

                    {/* Main menu on laptop */}
                    <div className={`hidden md:block ${groupSpaceClass}`}>
                      <div className="flex space-x-4">
                        {menuItems?.map(item => (
                          <Link
                            key={item?.id}
                            to={item?.url as string}
                            getProps={isActive}
                          >
                            {item?.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <form
                      onSubmit={event => {
                        event.preventDefault()
                        navigate(`/search/?s=${encodeURI(valueSearch)}`)
                      }}
                      className={`
                        relative ${groupSpaceClass} flex h-10 w-full items-center
                        overflow-hidden rounded-lg bg-[#282a36]
                        focus-within:shadow-inner
                      `}
                    >
                      <button
                        type="submit"
                        className="
                          grid h-full w-12 place-items-center text-slate-500
                          dark:text-gray-500 group
                        "
                      >
                        <FiSearch className="h-5 w-5 group-hover:text-green-300" />
                      </button>
                      <input
                        className="
                          peer h-full w-full text-ellipsis bg-transparent pr-2
                          text-white outline-none dark:text-gray-300
                        "
                        id="search"
                        type="search"
                        placeholder="tìm bài viết..."
                        autoComplete="off"
                        value={valueSearch}
                        ref={searchInput}
                        onChange={e => setValueSearch(e.target.value)}
                      />
                    </form>
                  </div>

                  {/* Right to search box */}
                  {/* <div
                    className={`
                      inset-y-0 right-0 flex items-center md:static md:inset-auto
                      ${groupSpaceClass} md:pr-0
                    `}
                  >
                    <Tippy
                      content={`${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                      placement="bottom"
                      arrow={false}
                      className="hidden md:block"
                    >
                      <button
                        className={`group rounded-lg p-2 ${textClass} focus:outline-none`}
                        onClick={onUpdateTheme}
                      >
                        {theme === 'light' && (
                          <RiMoonFill
                            className={`transition-transform group-active:scale-90 ${iconSizeClass}`}
                          />
                        )}
                        {theme === 'dark' && (
                          <RiSunFill
                            className={`transition-transform group-active:scale-90 ${iconSizeClass}`}
                          />
                        )}
                      </button>
                    </Tippy>

                    <Tippy
                      content="Github Math2IT"
                      placement="bottom"
                      arrow={false}
                      className="hidden md:block"
                    >
                      <a
                        className={`group hidden rounded-lg p-2 sm:block ${textClass} focus:outline-none
                      `}
                        href={'https://github.com/math2it'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGithub
                          className={`transition-transform group-active:scale-90 ${iconSizeClass}`}
                        />
                      </a>
                    </Tippy>
                  </div> */}
                </div>
              </div>

              {/* Main menu on mobile */}
              <Disclosure.Panel className="shadow-lg md:hidden">
                <div className="grid grid-cols-3 gap-2 px-2 pt-2 pb-3 text-lg">
                  {menuItems?.map(item => (
                    <Disclosure.Button
                      as={Link}
                      key={item?.id}
                      to={item?.url as string}
                      getProps={isActive}
                    >
                      {item?.label}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function isActive({ isCurrent }: { isCurrent: boolean }) {
  return {
    className: classNames(
      isCurrent ? 'bg-[#282a36] text-white' : textClass,
      cntl`block px-3 py-1.5 rounded-md text-base font-medium text-center
        h-14md:h-full flex items-center justify-center whitespace-nowrap`
    ),
    'aria-current': isCurrent ? 'page' : undefined,
  }
}
