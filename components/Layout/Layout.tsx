import Head from 'next/head'
import React, { FC } from 'react'

interface Props {
  title: string
  pageDescription: string
  children: React.ReactNode
}

export const Layout: FC<Props> = ({ children, title, pageDescription }) => {
  return (
    <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={pageDescription} />
      <meta name="og:title" content={pageDescription} />
    </Head>
    <nav>
    
    </nav>
    <main>{children}</main>
  </>
  )
}
