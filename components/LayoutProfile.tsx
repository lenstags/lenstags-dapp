import React, { FC, useContext, useEffect, useState } from 'react';

import Head from 'next/head';
import ProfileButton from './ProfileButton';
import { PublicRoutes } from 'models';
import Script from 'next/script';
import { SearchBar } from './SearchBar';
import SideBarLeft from './SideBarLeft';
import SideBarRight from './SideBarRight';
import { SidebarContext } from '@context/SideBarSizeContext';
import { Toaster } from './ui/ToasterUI';
import { useRouter } from 'next/router';

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
  setIsExplore: React.Dispatch<React.SetStateAction<boolean>>;
  isExplore: boolean;
  setSkipExplore: React.Dispatch<React.SetStateAction<boolean>>;
  skipExplore: boolean;
}

export const LayoutProfile: FC<Props> = ({
  children,
  title,
  pageDescription,
  setIsExplore,
  isExplore,
  setSkipExplore,
  skipExplore
}) => {
  const [hydrationLoading, setHydrationLoading] = useState(true);
  useEffect(() => {
    setHydrationLoading(false);
  }, []);

  const { sidebarCollapsedStateLeft } = useContext(SidebarContext);

  const router = useRouter();

  if (hydrationLoading) {
    return (
      <div role="status">
        <svg
          aria-hidden="true"
          className="mr-2 h-8 w-8 animate-spin fill-lime-300 text-gray-200 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

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
        src="/analytics/script.js"
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
        <main
          className={`${
            router.pathname.includes(PublicRoutes.MYPROFILE)
              ? 'col-span-10'
              : 'col-span-7'
          } overflow-x-clip ${
            sidebarCollapsedStateLeft.collapsed &&
            router.pathname !== PublicRoutes.APP &&
            !router.pathname.includes(PublicRoutes.PROFILE)
              ? 'col-start-2 col-end-10'
              : 'col-start-3'
          }`}
        >
          <div className="my-4 flex items-center justify-between mx-8">
            <SearchBar />
            {router.pathname.includes(PublicRoutes.MYPROFILE) && (
              <div className="sticky top-0">
                <ProfileButton />
              </div>
            )}
          </div>
          {children}
        </main>
        {!router.pathname.includes(PublicRoutes.MYPROFILE) && <SideBarRight />}
        <Toaster />
      </div>
    </>
  );
};
