import React, { FC } from 'react';

import Head from 'next/head';

interface Props {
  title: string;
  content: string;
}

const CustomHead: FC<Props> = ({ title, content }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta property="og:title" content="We are Nata Social" />
      {/* 
    <meta
      property="og:description"
      content="The first social bookmarking platform, backed by the community`s collective knowledge."
    />
    <meta property="og:image" content="banner.png" />

    <meta property="og:url" content="https://www.nata.social" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Nata Social" />
    <meta property="og:locale" content="en_US" /> */}

      {/* <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="favicon/apple-touch-icon.png"
      />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="favicon/favicon-32x32.png"
      />
      <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="favicon/favicon-16x16.png"
    /> */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />
    </Head>
  );
};

export default CustomHead;
