import React, { FC, useEffect, useState } from 'react';

import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';

// import ImageProxied from 'components/ImageProxied';

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
  screen?: boolean;
}

export const LayoutLanding: FC<Props> = ({
  children,
  title,
  pageDescription,
  screen
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta name="og:title" content={pageDescription} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <Script
        async
        defer
        data-website-id="d4364aba-a937-4eb1-ad86-085febbeb986"
        src="https://umami-natasocial.up.railway.app/umami.js"
      />
      <nav
        style={{
          background:
            'linear-gradient(175.76deg, rgba(255, 255, 255, 0.8) -259.19%, rgba(255, 255, 255, 0.4) 164.4%)',
          backdropFilter: 'blur(10px)'
        }}
        className="fixed top-0 z-50 flex w-full justify-between px-6 py-3 sm:px-16 md:px-32 lg:px-48 xl:px-64 2xl:px-72"
      >
        <div className="hidden sm:contents">
          <Link href={'/'}>
            <img
              src="/img/landing/nata-logo.svg"
              alt=""
              width={140}
              height={80}
            />
          </Link>
        </div>
        <div className="self-center sm:hidden">
          <Link href={'/'}>
            <img src="/img/landing/isologo.svg" alt="" width={32} height={80} />
          </Link>
        </div>
        <div
          style={{ marginTop: '3px' }}
          className="flex items-center font-serif  text-xs font-medium md:text-base"
        >
          <div className="mx-2 hidden p-2 sm:contents  ">
            <Link href={'#welcome'}>ABOUT</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'#features'}>PRODUCTS</Link>
          </div>

          <div className="mx-2 p-2 ">
            <a
              href="https://natasocial.gitbook.io"
              target="_blank"
              rel="noreferrer"
            >
              DOCS
            </a>

          </div>

          <div className="mx-2 p-2 ">
            <Link href={'#contact'}>CONTACT</Link>
          </div>
        </div>

        <a
          href="https://tally.so/r/mVjz7J"
          target="_blank"
          rel="noreferrer"
          style={{ marginTop: '4px', marginBottom: '4px' }}
          className="cursor-pointer whitespace-nowrap rounded-full bg-black px-4 py-2 font-serif  text-xs font-bold text-white md:text-sm   "
        >
          JOIN
        </a>
      </nav>

      <main className={`${!screen ? 'h-screen' : 'h-full'} mt-20 `}>
        {children}
      </main>
    </>
  );
};
