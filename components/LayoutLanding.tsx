import React, { FC, useEffect, useState } from 'react';

import Head from 'next/head';
import Link from 'next/link';

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
  const [show, setShow] = useState(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta name="og:title" content={pageDescription} />
      </Head>

      <nav
        style={{
          background:
            'linear-gradient(175.76deg, rgba(255, 255, 255, 0.8) -259.19%, rgba(255, 255, 255, 0.4) 164.4%)',
          backdropFilter: 'blur(10px)'
        }}
        className="fixed top-0 z-50 flex w-full  justify-between px-4 sm:px-16 md:px-32 lg:px-48 xl:px-64 2xl:px-72"
      >
        <div className="hidden sm:contents">
          <Link href={'/'}>
            <img
              // category="profile"
              src="/img/landing/nata-logo.svg"
              alt=""
              width={100}
              height={60}
            />
          </Link>
        </div>
        <div className="  self-center sm:hidden ">
          <Link href={'/'}>
            <img
              // category="profile"
              src="/img/landing/isologo.svg"
              alt=""
              width={32}
              height={32}
            />
          </Link>
        </div>
        <div className="flex items-center font-serif text-xs">
          <div className="mx-2 p-2 ">
            <Link href={'#welcome'}>ABOUT</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'#features'}>PRODUCTS</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'#'}>DOCS</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'mailto:info@nata.social'}>CONTACT</Link>
          </div>
        </div>

        <a
          href="/app"
          target="_blank"
          rel="noreferrer"
          className="my-3 cursor-pointer whitespace-nowrap rounded-full bg-black px-4 py-2 text-xs text-white  "
        >
          OPEN APP
        </a>
      </nav>

      <main className={`${!screen ? 'h-screen' : 'h-full'} mt-20 `}>
        {children}
      </main>
    </>
  );
};
