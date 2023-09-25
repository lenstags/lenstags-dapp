import React, { FC, useEffect, useState } from 'react';

import { DEFAULT_NATA_DOMAIN } from '@lib/config';
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
        <meta property="image" content="https://www.nata.social/banner.png" />
        <meta property="og:title" content="We are Nata Social" />
        <meta
          name="description"
          content="The first social bookmarking platform, backed by the community`s collective knowledge."
        />

        <meta
          property="og:description"
          content="The first social bookmarking platform, backed by the community`s collective knowledge."
        />
        <meta
          property="og:image"
          content="https://www.nata.social/banner.png"
        />
        <meta property="og:url" content="https://www.nata.social" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Nata Social" />
        <meta property="og:locale" content="en_US" />
        <meta
          name="twitter:card"
          content="https://www.nata.social/banner.png"
        />
        <meta property="twitter:domain" content="nata.social" />
        <meta property="twitter:url" content="nata.social" />
        <meta
          name="twitter:title"
          content="Nata Social | The home of your bookmarks"
        />
        <meta
          name="twitter:description"
          content="The first social bookmarking platform, backed by the community`s collective knowledge."
        />
        <meta
          name="twitter:image"
          content="https://www.nata.social/banner.png"
        />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      {/* <Script
        async
        defer
        src="analytics/script.js"
        data-website-id="4b989056-b471-4b8f-a39f-d2621ddb83c2"
      ></Script> */}

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XQNNYXZS5D"
      ></Script>
      <Script id="ss" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XQNNYXZS5D');
        `}
      </Script>

      <nav
        style={{
          background:
            'linear-gradient(175.76deg, rgba(255, 255, 255, 0.8) -259.19%, rgba(255, 255, 255, 0.4) 164.4%)',
          backdropFilter: 'blur(10px)'
        }}
        className="fixed top-0 z-50 flex w-full justify-between px-6 py-3 sm:px-16 md:px-32 lg:px-48 xl:px-64 2xl:px-72"
      >
        <div className="hidden sm:contents">
          <Link href={'/'} className="flex mb-1">
            <img
              src="/img/landing/nata-logo.svg"
              alt=""
              width={120}
              height={80}
            />
          </Link>
        </div>
        <div className="self-center mr-2 sm:hidden">
          <Link href={'/'}>
            <img
              src="/img/landing/isologo.svg"
              alt=""
              width={36}
              height={36}
              // style={{
              //   width: '120px',
              //   height: '80px',
              //   textAlign: 'left',
              //   alignSelf: 'self-end'
              // }}
            />
          </Link>
        </div>
        <div
          style={{ marginTop: '3px' }}
          className="flex items-center font-serif  text-xs font-medium md:text-base"
        >
          {/* <div className="mx-2 hidden p-2 sm:contents  ">
            <Link href={'#welcome'}>ABOUT</Link>
          </div> */}

          <div className="md:mx-2 p-2 ">
            <Link href={'#features'}>PRODUCTS</Link>
          </div>

          <div className="md:mx-2 p-2 ">
            <a
              href="https://natasocial.gitbook.io"
              target="_blank"
              rel="noreferrer"
            >
              DOCS
            </a>
          </div>

          <div className="md:mx-2 p-2 ">
            <Link href={'#contact'}>CONTACT</Link>
          </div>
        </div>

        <div className="my-2 md:ml-5">
          <a
            href={DEFAULT_NATA_DOMAIN}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer whitespace-nowrap rounded-full bg-black px-4 py-2 font-serif
             text-xs font-bold text-white md:text-sm   "
          >
            OPEN APP
          </a>
        </div>
      </nav>

      <main className={`${!screen ? 'h-screen' : 'h-full'} mt-20 `}>
        {children}
      </main>
    </>
  );
};
