import {
  APP_UI_VERSION,
  ATTRIBUTES_LIST_KEY,
  DEFAULT_CHAIN_ID
} from '@lib/config';
 
import { ProfileContext, TagsFilterContext } from 'components';
import { enable, queryProfile } from '@lib/lens/enable-dispatcher';
import { explore, reqQuery } from '@lib/lens/explore-publications';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import { ExplorePublicationsDocument } from '@lib/lens/graphql/generated';
import ExplorerCard from 'components/ExplorerCard';
import Head from 'next/head';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components/Layout';
import type { NextPage } from 'next';
import Script from 'next/script';
import { SearchBar } from '@components/SearchBar';
import { Spinner } from 'components/Spinner';
import { TagsFilter } from 'components/TagsFilter';
import { createDefaultList } from '@lib/lens/load-lists';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { findKeyAttributeInProfile } from 'utils/helpers';
import { useDisconnect } from 'wagmi';
import { useQuery } from '@apollo/client';
import { useSnackbar } from 'material-ui-snackbar-provider';

const App: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [hydrationLoading, setHydrationLoading] = useState(true);
  useEffect(() => {
    setHydrationLoading(false);
  }, []);
  const { chain } = useNetwork();

  const { tags } = useContext(TagsFilterContext);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadingFetchMore, setLoadingFetchMore] = useState(false);
  const [loader, setLoader] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { disconnect } = useDisconnect();
  const snackbar = useSnackbar();
  const { profile: lensProfile } = useContext(ProfileContext);

  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork({
      chainId: DEFAULT_CHAIN_ID,
      onError(error) {
        console.log('Error', error);
      },
      onSuccess(data) {
        console.log('Success', data);
      }
    });

  // let provider: Web3Provider;

  // const networkMap = {
  //   POLYGON_MAINNET: {
  //     chainId: hexValue(137), // '0x89'
  //     chainName: 'Polygon Mainnet',
  //     nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  //     rpcUrls: ['https://polygon-rpc.com'],
  //     blockExplorerUrls: ['https://www.polygonscan.com/']
  //   },
  //   MUMBAI_TESTNET: {
  //     chainId: hexValue(80001), // '0x13881'
  //     chainName: 'Polygon Mumbai Testnet',
  //     nativeCurrency: { name: 'tMATIC', symbol: 'tMATIC', decimals: 18 },
  //     rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
  //     blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  //   }
  // };

  // const switchChains = async (chainId: number) => {
  //   const id: string = hexValue(chainId);
  //   try {
  //     await provider.send('wallet_switchEthereumChain', [{ chainId: id }]);
  //     console.log('switched to chain', chainId);
  //   } catch (error) {
  //     // @ts-ignore
  //     if (error.code === 4902) {
  //       console.log("this network is not in the user's wallet");
  //       await provider.send('wallet_addEthereumChain', [
  //         chainId === 80001
  //           ? networkMap.MUMBAI_TESTNET
  //           : networkMap.POLYGON_MAINNET
  //       ]);
  //     }

  //     throw error;
  //   }
  // };

  // function normalizeChainId(chainId: string | number | bigint) {
  //   if (typeof chainId === 'string')
  //     return Number.parseInt(
  //       chainId,
  //       chainId.trim().substring(0, 2) === '0x' ? 16 : 10
  //     );
  //   if (typeof chainId === 'bigint') return Number(chainId);
  //   return chainId;
  // }

  // const getChainId = async (): Promise<number> => {
  //   return provider.send('eth_chainId', []).then(normalizeChainId);
  // };

  // const ensureCorrectChain = async () => {
  //   const currentChainId = await getChainId();
  //   if (currentChainId !== DEFAULT_CHAIN_ID) {
  //     await switchChains(DEFAULT_CHAIN_ID);
  //   }
  // };

  const handleSetup = async () => {
    // await ensureCorrectChain();

    const profileResult = await queryProfile({ profileId: lensProfile!.id });
    const listAttributeObject = findKeyAttributeInProfile(
      profileResult,
      ATTRIBUTES_LIST_KEY
    );
    console.log('profileResult ', profileResult);

    const hasLists =
      listAttributeObject && JSON.parse(listAttributeObject.value).length > 0;
    console.log('>>> hasLists ', hasLists);

    const dispatcherEnabled = profileResult
      ? profileResult.dispatcher?.canUseRelay || false
      : false;

    if (!dispatcherEnabled || !hasLists) {
      console.log('>>>   enabledRelayer: ', dispatcherEnabled);

      setShowWelcome(true);
      try {
        if (profileResult && !dispatcherEnabled) {
          snackbar.showMessage('🟦 Enabling Tx Dispatcher...');
          const res = await enable(profileResult.id);
          console.log('RRR ', res);
          if (!res) {
            setShowReject(true);
            return;
          }
          snackbar.showMessage('🟦 Dispatcher enabled successfully.');
        }

        if (!hasLists) {
          snackbar.showMessage('🟦 Creating default list...');
          await createDefaultList(profileResult);
          snackbar.showMessage('💚 LFGrow ⚜️!');
        }
        setReady(true);
      } catch (err: any) {
        if (err.code === 'ACTION_REJECTED') {
          setShowReject(true);
        } else {
          console.log('Unknown error!: ', err.code);
        }
      }
    }
  };

  useEffect(() => {
    if (lensProfile?.id && chain) {
      console.log('rrrrr ', chain);
      if (chain.id !== DEFAULT_CHAIN_ID) {
        // switch
        switchNetwork?.(DEFAULT_CHAIN_ID);
      }
      handleSetup();
    }
  }, [lensProfile, chain]);

  /**
   * Infinite scroll
   */
  const query = useMemo(() => {
    if (!tags) return reqQuery;
    reqQuery.metadata = {
      locale: 'en',
      tags: { oneOf: tags }
    };
    return reqQuery;
  }, [tags]);

  const { fetchMore } = useQuery(ExplorePublicationsDocument, {
    variables: {
      request: query
    },
    onCompleted: (data) => {
      if (cursor === undefined)
        setCursor(data.explorePublications.pageInfo.next);
    }
  });

  const handleLoadMoreWithoutTags = useCallback(() => {
    if (!cursor) return console.log('no more results');
    setLoadingFetchMore(true);
    fetchMore({
      variables: {
        request: {
          ...query,
          cursor
        }
      },
      updateQuery: (prev, { fetchMoreResult }): any => {
        if (!fetchMoreResult) return 'no more results';
        return {
          explorePublications: {
            ...fetchMoreResult.explorePublications
          }
        };
      }
    }).then((res) => {
      if (res.data.explorePublications.items.length > 0) {
        setCursor(res.data.explorePublications.pageInfo.next);
        setPublications((prev) => [
          ...prev,
          ...res.data.explorePublications.items
        ]);
        setLoadingFetchMore(false);
      } else {
        setLoadingFetchMore(false);
        return console.log('no more results');
      }
    });
  }, [cursor, fetchMore, query]);

  const handleLoadMoreWithTags = useCallback(() => {
    setLoadingFetchMore(true);
    fetchMore({
      variables: {
        request: {
          ...query,
          cursor
        }
      },
      updateQuery: (prev, { fetchMoreResult }): any => {
        if (!fetchMoreResult) return 'no more results';
        return {
          explorePublications: {
            ...fetchMoreResult.explorePublications
          }
        };
      }
    }).then((res) => {
      if (res.data.explorePublications.items.length > 0) {
        setCursor(res.data.explorePublications.pageInfo.next);
        setPublications((prev) => [
          ...prev,
          ...res.data.explorePublications.items
        ]);
        setLoadingFetchMore(false);
      } else {
        setLoadingFetchMore(false);
        return console.log('no more results');
      }
    });
  }, [cursor, fetchMore, query]);

  const observer = useRef<IntersectionObserver>();
  const lastPublicationRef = useCallback(
    (node: HTMLDivElement | null | undefined) => {
      if (publications.length === 0) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && cursor && tags.length === 0) {
          handleLoadMoreWithoutTags();
        } else if (entries[0].isIntersecting && cursor && tags.length > 0) {
          handleLoadMoreWithTags();
        }
      });
      if (node) observer.current.observe(node);
    },
    [
      cursor,
      publications?.length,
      tags.length,
      handleLoadMoreWithTags,
      handleLoadMoreWithoutTags
    ]
  );

  useEffect(() => {
    setLoader(true);
    explore({ locale: 'en', tags })
      .then((data) => {
        setLoader(false);
        if (!data) return setPublications([]);
        setCursor(data.pageInfo.next);
        return setPublications(data.items);
      })
      .catch((err) => {
        console.log('ERROR ', err);
        setLoader(false);
      });
  }, [tags]);

  if (hydrationLoading) {
    return (
      <div className="flex">
        <div className="my-8 justify-center">
          <Spinner h="10" w="10" />
        </div>
      </div>
    );
  }

  const handleWelcomeClick = () => {
    setShowWelcome(false);
  };

  // content filtering
  // const fetchMyCollects = async () => {
  //   if (!lp) {
  //     return;
  //   }

  //   const res = await getPublications(
  //     [PublicationTypes.Post],
  //     undefined,
  //     lp?.ownedBy
  //   );
  //   console.log('RES ', res);
  //   // TODO LENS ISSUE: APPID MISMATCHES SOURCES PARAM
  //   setPublications(res.items.filter((i) => i.appId === APP_NAME)); // TODO PAGINATION CURSOR
  // };

  // const fetchContentLists = async () => {
  //   const res = await getPublications(
  //     [PublicationTypes.Post],
  //     lensProfile.id
  //   );
  //   setPublications(
  //     res.items.filter(
  //       (r) =>
  //         (r.profile.id === lensProfile?.id &&
  //           r.metadata.attributes[0].value === 'list') ||
  //         r.metadata.attributes[0].value === 'privateDefaultList' // FIXME internalPublicationType
  //       //     .attributes?.find((attribute) => attribute.key === 'internalPublicationType')?.value || '',
  //     )
  //   ); // TODO PAGINATION CURSOR
  // };

  // const fetchAll = async () => {
  //   // my pubs+lists
  //   const myPublications = await getPublications(
  //     [PublicationTypes.Post],
  //     lensProfile.id
  //   );
  //   // my collects
  //   const myCollects = await getPublications(
  //     [PublicationTypes.Post],
  //     undefined,
  //     lp?.ownedBy
  //   );
  //   const filteredCollects = myCollects.items.filter(
  //     (i) => i.appId === APP_NAME
  //   ); // TODO this is because sources!=appId

  //   const array1 = myPublications.items;
  //   const array2 = filteredCollects;
  //   const mergedArray = [...array1, ...array2].reduce(
  //     (a: any, b: any) => (a.some((o: any) => o.id === b.id) ? a : [...a, b]),
  //     []
  //   );

  //   setPublications(mergedArray); // TODO PAGINATION CURSOR
  // };

  return (
    <>
      <Head>
        <title>Nata Social</title>
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
      <Script
        async
        defer
        src="https://analytics.umami.is/script.js"
        data-website-id="4b989056-b471-4b8f-a39f-d2621ddb83c2"
      ></Script>

      <Layout title={'Nata Social | Home'} pageDescription={'Welcome!'}>
        {showWelcome ? (
          <div
            className=" duration-600 fixed 
          bottom-0 
          left-0 right-0
          top-0 z-50 flex h-full w-full flex-col items-center  justify-center bg-stone-900
          "
            style={{
              backgroundImage:
                'linear-gradient(to bottom, gray, rgb(45 212 191))',
              backgroundSize: '400% 400%',
              animation: 'gradient 10s ease infinite'
            }}
          >
            <div className="mt-10 font-mono">
              {chain && <div>Connected to {chain.name}</div>}
            </div>
            <ImageProxied
              className="mt-20"
              category="profile"
              src="/img/landing/nata-logo.svg"
              alt=""
              width={200}
              height={120}
            />
            <style jsx>{`
              @keyframes gradient {
                0% {
                  background-position: 0% 0%;
                }
                50% {
                  background-position: 100% 100%;
                }
                100% {
                  background-position: 0% 0%;
                }
              }
            `}</style>
            <div className="  h-full w-2/3 max-w-xl content-center items-center justify-center py-20 text-center font-mono">
              <p className=" mb-6 text-center font-sans text-4xl ">Welcome!</p>
              <p className="py-6 text-justify font-serif text-lg">
                This platform is an <b>Alpha</b> release
                <i> (fresh out of the oven)</i>, meaning that some unexpected
                behaviour may occur. We appreciate your understanding and
                encourage you to report any issues you encounter.
              </p>

              <p className="py-4">Yours, The Nata Social team ⚜️</p>

              <p className="pb-4 text-xs">
                P.S.: Meanwhile, we are performing some setup tasks in
                background, fasten your seat belts! 🚀
              </p>

              {ready ? (
                <div>
                  <button
                    className=" bg-black px-4 py-2 font-serif text-white hover:bg-gray-700"
                    onClick={handleWelcomeClick}
                  >
                    Continue
                  </button>
                </div>
              ) : (
                !showReject && (
                  <div className="flex justify-center">
                    <Spinner h="8" w="8" />
                  </div>
                )
              )}

              {showReject && (
                <div className="mt-6 rounded-lg border border-black px-8 py-4 text-center font-sans  ">
                  <h1 className="py-2">⛔️ Oops!</h1>
                  <h2>
                    Seems that you rejected your wallet signature petitions.
                  </h2>
                  <br></br>
                  <div className=" text-justify">
                    In order to finish your account setup, we encourage to sign
                    the following two wallet interactions:
                    <p>
                      - The dispatcher signature: sets you free from signing TX!
                    </p>
                    <p>
                      - The default saved items list: the main folder where you
                      will store your posts.
                    </p>
                  </div>

                  <div className="my-4 flex justify-between">
                    <button
                      onClick={() => {
                        setShowReject(false);
                        handleSetup();
                      }}
                      className="rounded-lg bg-black px-6 py-1 text-white"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        deleteLensLocalStorage();
                        disconnect();
                        setShowReject(false);
                        setShowWelcome(false);
                      }}
                      className="rounded-lg  border border-solid border-black 
                      bg-transparent px-6 py-1"
                    >
                      Cancel, navigate without registering
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-10">
              <hr />
              <div className="font-mono text-xs">ui v{APP_UI_VERSION}</div>
            </div>
          </div>
        ) : (
          <>
            {/* top bar container*/}
            <div className="h-50 sticky top-0 z-10 w-full bg-white px-8 py-2 pt-4">
              {/* search bar */}
              <SearchBar />
              <TagsFilter />

              {/* view options */}
              {/* <div className="mt-2 flex justify-between rounded-t-lg  py-2">
                <div className="flex  gap-1  font-sans font-medium tracking-wide">
                  <button
                    // onClick={fetchContentAll}
                    className="rounded border
                  border-solid border-black px-4 py-1 align-middle 
                  text-white"
                  >
                    All
                  </button>

                  <button
                    // onClick={openConnectModal}
                    className="py -2 rounded
                  border border-solid border-black bg-white px-4 
                  align-middle text-black"
                  >
                    Lists
                  </button>

                  <button
                    // onClick={openConnectModal}
                    className="py -2 rounded
                  border border-solid border-black bg-white px-4 
                  align-middle text-black"
                  >
                    Posts
                  </button>
                </div>

                <div className="flex gap-1  font-sans font-medium tracking-wide">
                  <button
                    // onClick={openConnectModal}
                    className="py -2 rounded
                  border border-solid border-black px-3 align-middle 
                  text-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.68599 7.69005H8.31099M7.68599 8.31505H8.31099M7.68599 1.85672H8.31099M7.68599 2.48172H8.31099M7.68599 13.5234H8.31099M7.68599 14.1484H8.31099M1.85266 7.69005H2.47766M1.85266 8.31505H2.47766M1.85266 1.85672H2.47766M1.85266 2.48172H2.47766M1.85266 13.5234H2.47766M1.85266 14.1484H2.47766M13.5193 7.69005H14.1443M13.5193 8.31505H14.1443M13.5193 1.85672H14.1443M13.5193 2.48172H14.1443M13.5193 13.5234H14.1443M13.5193 14.1484H14.1443M8.83203 8.0026C8.83203 8.46284 8.45894 8.83594 7.9987 8.83594C7.53846 8.83594 7.16536 8.46284 7.16536 8.0026C7.16536 7.54237 7.53846 7.16927 7.9987 7.16927C8.45894 7.16927 8.83203 7.54237 8.83203 8.0026ZM8.83203 2.16927C8.83203 2.62951 8.45894 3.0026 7.9987 3.0026C7.53846 3.0026 7.16536 2.62951 7.16536 2.16927C7.16536 1.70903 7.53846 1.33594 7.9987 1.33594C8.45894 1.33594 8.83203 1.70903 8.83203 2.16927ZM8.83203 13.8359C8.83203 14.2962 8.45894 14.6693 7.9987 14.6693C7.53846 14.6693 7.16536 14.2962 7.16536 13.8359C7.16536 13.3757 7.53846 13.0026 7.9987 13.0026C8.45894 13.0026 8.83203 13.3757 8.83203 13.8359ZM2.9987 8.0026C2.9987 8.46284 2.6256 8.83594 2.16536 8.83594C1.70513 8.83594 1.33203 8.46284 1.33203 8.0026C1.33203 7.54237 1.70513 7.16927 2.16536 7.16927C2.6256 7.16927 2.9987 7.54237 2.9987 8.0026ZM2.9987 2.16927C2.9987 2.62951 2.6256 3.0026 2.16536 3.0026C1.70513 3.0026 1.33203 2.62951 1.33203 2.16927C1.33203 1.70903 1.70513 1.33594 2.16536 1.33594C2.6256 1.33594 2.9987 1.70903 2.9987 2.16927ZM2.9987 13.8359C2.9987 14.2962 2.6256 14.6693 2.16536 14.6693C1.70513 14.6693 1.33203 14.2962 1.33203 13.8359C1.33203 13.3757 1.70513 13.0026 2.16536 13.0026C2.6256 13.0026 2.9987 13.3757 2.9987 13.8359ZM14.6654 8.0026C14.6654 8.46284 14.2923 8.83594 13.832 8.83594C13.3718 8.83594 12.9987 8.46284 12.9987 8.0026C12.9987 7.54237 13.3718 7.16927 13.832 7.16927C14.2923 7.16927 14.6654 7.54237 14.6654 8.0026ZM14.6654 2.16927C14.6654 2.62951 14.2923 3.0026 13.832 3.0026C13.3718 3.0026 12.9987 2.62951 12.9987 2.16927C12.9987 1.70903 13.3718 1.33594 13.832 1.33594C14.2923 1.33594 14.6654 1.70903 14.6654 2.16927ZM14.6654 13.8359C14.6654 14.2962 14.2923 14.6693 13.832 14.6693C13.3718 14.6693 12.9987 14.2962 12.9987 13.8359C12.9987 13.3757 13.3718 13.0026 13.832 13.0026C14.2923 13.0026 14.6654 13.3757 14.6654 13.8359Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <button
                    // onClick={openConnectModal}
                    className="py -2 rounded
                  border border-solid border-black bg-white px-3 
                  align-middle text-black"
                  >
                    <svg
                      width="16"
                      height="12"
                      viewBox="0 0 16 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.66536 1H14.6654M4.66536 6H14.6654M4.66536 11H14.6654M1.33203 1H1.33286M1.33203 6H1.33286M1.33203 11H1.33286"
                        stroke="#121212"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div> */}
            </div>

            {/* publications */}
            <div className="px-4 pb-6">
              <div className="flex flex-wrap justify-center rounded-b-lg px-3 pb-6">
                {publications.length > 0 ? (
                  publications.map((post, index) => {
                    if (publications.length === index + 1) {
                      return (
                        <ExplorerCard
                          post={post}
                          key={index}
                          refProp={lastPublicationRef}
                        />
                      );
                    } else {
                      return (
                        <ExplorerCard post={post} key={index} refProp={null} />
                      );
                    }
                  })
                ) : loader ? (
                  <div className="my-8">
                    <Spinner h="10" w="10" />
                  </div>
                ) : (
                  <div className="my-8">
                    <span className="text-lg font-medium">
                      No results found 🤷‍♂️
                    </span>
                  </div>
                )}
              </div>
              {loadingFetchMore && (
                <div className="mx-auto mb-10 flex w-10 items-center justify-center ">
                  <Spinner h="10" w="10" />
                </div>
              )}
            </div>
          </>
        )}
      </Layout>
    </>
  );
};
<style jsx>{`
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`}</style>;

export default App;
