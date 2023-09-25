import React, { FC, useEffect, useState } from 'react';

import Head from 'next/head';
import Script from 'next/script';
import SideBarLeft from './SideBarLeft';
import Topbar from './Topbar';

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
  screen?: boolean;
  breadcumpTitle: string;
  setIsExplore: React.Dispatch<React.SetStateAction<boolean>>;
  isExplore: boolean;
  setSkipExplore: React.Dispatch<React.SetStateAction<boolean>>;
  skipExplore: boolean;
}

export const LayoutCreate: FC<Props> = ({
  children,
  title,
  pageDescription,
  screen,
  breadcumpTitle,
  setIsExplore,
  isExplore,
  setSkipExplore,
  skipExplore
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content="We are Nata Social" />
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
        src="https://analytics.umami.is/script.js"
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

      <div className="grid w-full grid-cols-12">
        <SideBarLeft
          setIsExplore={setIsExplore}
          isExplore={isExplore}
          setSkipExplore={setSkipExplore}
          skipExplore={skipExplore}
        />
        <div className="col-span-12 col-start-2 overflow-x-clip">
          <Topbar breadcumpTitle={breadcumpTitle} />
          <main
            // FIXME Remove the absolute and left, when the sidebar
            // has no the fixed anymore!!!
            // plus adjust to use w-10/12
            // style={{ left: '16.666667%', width: '75.6667%' }}
            className="mt-16 w-full px-4 pt-5"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
