import {
  APP_UI_VERSION,
  ATTRIBUTES_LIST_KEY,
  DEFAULT_CHAIN_ID,
  DEFAULT_NETWORK
} from '@lib/config';
import { ProfileContext, TagsFilterContext } from 'components';
import { enable, queryProfile } from '@lib/lens/enable-dispatcher';
import { explore, reqQuery } from '@lib/lens/explore-publications';
import { findKeyAttributeInProfile, validateWhitelist } from 'utils/helpers';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import {
  ExplorePublicationsDocument,
  PublicationSortCriteria
} from '@lib/lens/graphql/generated';
import ExplorerCard from 'components/ExplorerCard';
import Head from 'next/head';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components/Layout';
import type { NextPage } from 'next';
import Script from 'next/script';
import { SearchBar } from '@components/SearchBar';
import { Spinner } from 'components/Spinner';
import { TagsFilter } from 'components/TagsFilter';
import {
  Filter,
  SortFilterControls,
  SortingValuesType
} from '@components/SortFilterControls';
import WhitelistScreen from '@components/WhitelistScreen';
import { createDefaultList } from '@lib/lens/load-lists';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
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
  const [isVisibleWL, setIsVisibleWL] = useState<boolean>(false); //HEREEE
  const { disconnect } = useDisconnect();
  const snackbar = useSnackbar();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [sortingValues, setSortingValues] = useState<SortingValuesType>({
    date: 'all',
    sort: PublicationSortCriteria.Latest,
    by: 'all'
  });
  const [filterValue, setFilterValue] = useState<Filter>(Filter.ALL);

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
    const fetchData = async (address: string, chainId: number) => {
      await validateWhitelist(address).then((isInWL) => {
        if (isInWL) {
          setIsVisibleWL(false);
          if (chainId !== DEFAULT_CHAIN_ID) {
            // switch
            switchNetwork?.(DEFAULT_CHAIN_ID);
          }
          handleSetup();
        } else {
          setIsVisibleWL(true);
          deleteLensLocalStorage();
          disconnect();
          return;
        }
      });
    };

    if (lensProfile?.id && chain) {
      fetchData(lensProfile.ownedBy, chain.id);
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
    explore({ locale: 'en', sortingValues, filterValue, tags })
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
  }, [tags, sortingValues, filterValue]);

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

      <Layout title={'Nata Social | Home'} pageDescription={'Home'}>
        {isVisibleWL ? (
          <WhitelistScreen />
        ) : showWelcome ? (
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
              <div className="font-mono text-xs">
                ui v{APP_UI_VERSION} - {DEFAULT_NETWORK}
              </div>
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
              <SortFilterControls
                sortingValues={sortingValues}
                setSortingValues={setSortingValues}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
              />
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
