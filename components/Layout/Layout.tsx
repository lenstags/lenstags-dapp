import Head from "next/head";
import React, { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { UnauthorizedScreen } from '../UnauthorizedScreen/UnauthorizedScreen';
import { Navbar } from "components";

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
}

export const Layout: FC<Props> = ({ children, title, pageDescription }) => {
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
          <main className="h-screen bg-white">{children}</main>
        </>
      ) : (
        <UnauthorizedScreen />
      )}
      {/* Replace this line to ONLY use Lens Login */}
      {/* {profile ? <Nav /> : <UnauthorizedScreen />} */}
    </>
  );
};
