import Head from "next/head";
import React, { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Navbar, UnauthorizedScreen } from "components";

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
  screen?: boolean
}

export const Layout: FC<Props> = ({ children, title, pageDescription, screen }) => {
  const { isConnected } = useAccount();
  const [hydrationLoading, sethydrationLoading] = useState(true);
  useEffect(() => {
    sethydrationLoading(false);
  }, []);

  if (hydrationLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta name="og:title" content={pageDescription} />
      </Head>
      {isConnected ? (
        <>
          {" "}
          <nav>
            <Navbar />
          </nav>
          <main className={`${ !screen ? 'h-screen' : 'h-full'} bg-white`}>{children}</main>
        </>
      ) : (
        <UnauthorizedScreen />
      )}
      {/* Replace this line to ONLY use Lens Login */}
      {/* {profile ? <Nav /> : <UnauthorizedScreen />} */}
    </>
  );
};
