import React, { FC, useEffect, useState } from 'react';

import Head from 'next/head';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';

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
            <ImageProxied
              category="profile"
              src="/img/landing/nata-logo.svg"
              alt=""
              width={100}
              height={60}
            />
          </Link>
        </div>
        <div className="  self-center sm:collapse ">
          <Link href={'/'}>
            <ImageProxied
              category="profile"
              src="/img/landing/isologo.svg"
              alt=""
              width={32}
              height={32}
            />
          </Link>
        </div>
        <div className="flex items-center font-serif text-xs">
          <div className="mx-2 p-2 ">
            <Link href={'/app'}>ABOUT</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'/app'}>PRODUCTS</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'/app'}>DOCS</Link>
          </div>

          <div className="mx-2 p-2 ">
            <Link href={'/app'}>CONTACT</Link>
          </div>
        </div>

        <button className="my-3  whitespace-nowrap rounded-full bg-black px-4 py-2 text-xs text-white  ">
          OPEN APP
        </button>
      </nav>

      <main className={`${!screen ? 'h-screen' : 'h-full'} mt-20 `}>
        {children}
      </main>
    </>
  );
};
