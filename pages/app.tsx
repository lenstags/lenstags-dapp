import { APP_NAME, LENSTAGS_SOURCE } from '@lib/config';
import {
  CustomFiltersTypes,
  ExplorePublicationsDocument,
  ExplorePublicationsQuery,
  FeedEventItemType,
  FeedRequest,
  PaginatedFeedResult,
  ProfileFeedDocument,
  PublicationContentWarning,
  PublicationSortCriteria,
  PublicationTypes
} from '@lib/lens/graphql/generated';
import { ProfileContext, TagsFilter, TagsFilterContext } from 'components';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { useQuery } from '@apollo/client';
import {
  Filter,
  SortFilterControls,
  SortingValuesType
} from '@components/SortFilterControls';
import { explore, reqQuery } from '@lib/lens/explore-publications';
import { CardViewsMap } from '@components/CardViewButtons';
import CustomHead from '@components/CustomHead';
import { DotWave } from '@uiball/loaders';
import { SearchBar } from '@components/SearchBar';
import WelcomePanel from '@components/WelcomePanel';
import WhitelistScreen from '@components/WhitelistScreen';
import { useExplore } from '@context/ExploreContext';
import { ViewBy, ViewCardContext } from '@context/ViewCardContext';
import useCheckWhitelist from '@lib/hooks/useCheckWhitelist';
import { cn } from '@lib/utils';
import { Layout } from 'components/Layout';
import { Spinner } from 'components/Spinner';
import type { NextPage } from 'next';
import Script from 'next/script';
import { useNetwork } from 'wagmi';

const App: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [hydrationLoading, setHydrationLoading] = useState(true);
  useEffect(() => {
    setHydrationLoading(false);
  }, []);

  const { chain } = useNetwork();
  const { tags } = useContext(TagsFilterContext);
  const [loadingFetchMore, setLoadingFetchMore] = useState(false);
  const [loader, setLoader] = useState(false);
  const [finished, setFinished] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const { profile: lensProfile } = useContext(ProfileContext);
  const [sortingValues, setSortingValues] = useState<SortingValuesType>({
    date: 'all',
    sort: PublicationSortCriteria.Latest,
    by: 'all'
  });
  const [filterValue, setFilterValue] = useState<Filter>(Filter.ALL);
  const { viewCard } = useContext(ViewCardContext);
  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();

  const {
    checkWhitelist,
    isVisibleWL,
    setIsVisibleWL,
    showWelcome,
    setShowWelcome,
    welcomeReady
  } = useCheckWhitelist(lensProfile);

  /*
   *  whitelist validation HOOKEABLE
   */
  useEffect(() => {
    if (lensProfile?.id && chain) {
      checkWhitelist(lensProfile.ownedBy, chain.id);
    }
  }, [lensProfile, chain]); // removed checkWhitelist!

  /*
   * main query definitions
   */
  const limitPosts = 30;
  const resExplore = useQuery(ExplorePublicationsDocument, {
    variables: {
      request: {
        sortCriteria: PublicationSortCriteria.Latest,
        noRandomize: true,
        sources: [LENSTAGS_SOURCE],
        limit: limitPosts,
        publicationTypes: [PublicationTypes.Post],
        customFilters: [CustomFiltersTypes.Gardeners],
        metadata: {
          locale: 'en',
          tags: { oneOf: tags }
          // FIXME this is not working as Lens said...
          // contentWarning: {
          //   includeOneOf: [
          //     PublicationContentWarning.Nsfw
          //     // PublicationContentWarning.Sensitive
          //     // PublicationContentWarning.Spoiler
          //   ]
          // }
        }
      }
    },
    skip: skipExplore // when true is skipped
  });

  const resFollowing = useQuery(ProfileFeedDocument, {
    variables: {
      request: {
        profileId: lensProfile?.id,
        sources: [APP_NAME],
        feedEventItemTypes: [FeedEventItemType.Post],
        metadata: {
          locale: 'en',
          tags: { oneOf: tags }
          // contentWarning: {
          //   includeOneOf: [
          //     PublicationContentWarning.Nsfw,
          //     PublicationContentWarning.Sensitive,
          //     PublicationContentWarning.Spoiler
          //   ]
          // }
        }
      }
    },
    skip: !skipExplore
  });

  const {
    fetchMore,
    data,
    loading,
    error: apolloError
  } = isExplore ? resExplore : resFollowing;

  // Primer useEffect para manejar la actualización de 'publications' y 'cursor'
  useEffect(() => {
    setPublications([]); // Limpiar datos

    if (!data) {
      return;
    }

    if (isExplore) {
      // @ts-ignore
      const { pageInfo, items } = data.explorePublications;
      setCursor(pageInfo.next);
      setPublications(items);
    } else {
      // @ts-ignore
      const { items, pageInfo, __typename } = data.feed;
      const newRes: PaginatedFeedResult = {
        items: items.map((r: any) => r.root),
        pageInfo,
        __typename
      };
      setCursor(newRes.pageInfo.next);
      setPublications(newRes.items);
    }
  }, [data, isExplore, tags, lensProfile]);

  // Segundo useEffect para manejar el estado del 'loader'
  useEffect(() => {
    setLoader(loading);
  }, [loading]);

  // Tercer useEffect para manejar errores de Apollo
  useEffect(() => {
    if (apolloError) {
      console.log('⛔️ ⛔️ ⛔️ Error fetching data', apolloError);
    }
  }, [apolloError]);

  // use/Effect(() => {
  //   setPublications([]); // cleans data

  //   if (data) {
  //     if (typeof data === 'undefined') {
  //       return;
  //     }

  //     if (isExplore) {
  //       // @ts-ignore
  //       const t = data.explorePublications;
  //       setCursor(t.pageInfo.next);
  //       setPublications(t.items);
  //       return;
  //     }

  //     // @ts-ignore
  //     const t = data.feed;
  //     const newRes: PaginatedFeedResult = {
  //       items: t.items.map((r: any) => r.root),
  //       pageInfo: t.pageInfo,
  //       __typename: t.__typename
  //     };
  //     setCursor(newRes.pageInfo.next);
  //     setPublications(newRes.items);
  //     return;
  //   }
  // }, [data, isExplore, tags]);

  // use/Effect(() => {
  //   setLoader(loading);
  // }, [loading, resExplore]);

  // use/Effect(() => {
  //   setLoader(loading);
  // }, [data]);

  // use/Effect(() => {
  //   setLoader(loading);
  // }, [loading]);

  // use/Effect(() => {
  //   if (apolloError) {
  //     console.log('⛔️ ⛔️ ⛔️ Error fetching data', apolloError);
  //   }
  // }, [apolloError]);

  /**
   * Infinite scroll
   */
  const reqQueryFeed: FeedRequest = {
    profileId: lensProfile?.id,
    sources: [APP_NAME],
    feedEventItemTypes: [FeedEventItemType.Post]
  };

  const query2 = useMemo(() => {
    const finalReq = isExplore ? reqQuery : reqQueryFeed;
    if (!tags) {
      return finalReq;
    }

    finalReq.metadata = {
      locale: 'en',
      tags: { oneOf: tags }
      // contentWarning: {
      //   includeOneOf: [
      //     PublicationContentWarning.Nsfw,
      //     PublicationContentWarning.Sensitive,
      //     PublicationContentWarning.Spoiler
      //   ]
      // }
    };

    if (!isExplore && lensProfile) {
      // @ts-ignore
      finalReq.profileId = lensProfile.id;
    }
    return finalReq;
  }, [tags, isExplore, lensProfile]);

  const handleLoadMoreWithoutTags = useCallback(() => {
    if (!cursor) {
      setFinished(true);
      return console.log('no more results');
    }
    setLoadingFetchMore(true);
    fetchMore({
      variables: {
        request: {
          ...query2,
          cursor
        }
      },
      updateQuery: (prev, { fetchMoreResult }): any => {
        if (!fetchMoreResult) {
          setFinished(true);
          return 'no more results';
        }

        const feedResult = {
          explorePublicationsResult: {
            ...fetchMoreResult.feed
          }
        };

        const explorePublicationsResult = {
          explorePublications: {
            // @ts-ignore
            ...fetchMoreResult.explorePublications
          }
        };

        return isExplore ? explorePublicationsResult : feedResult;
      }
    }).then((res) => {
      const t = res.data;
      // @ts-ignore
      if (t.explorePublications?.items.length > 0 || t.feed?.items.length > 0) {
        if (isExplore) {
          const newRes = {
            // @ts-ignore
            items: t.explorePublications.items,
            // @ts-ignore
            pageInfo: t.explorePublications.pageInfo,
            // @ts-ignore
            __typename: t.explorePublications.__typename
          };
          setCursor(newRes.pageInfo.next);
          setPublications((prev) => [...prev, ...newRes.items]);
        } else {
          const newRes = {
            items: t.feed.items.map((r: any) => r.root),
            pageInfo: t.feed.pageInfo,
            __typename: t.feed.__typename
          };
          setCursor(newRes.pageInfo.next);
          setPublications((prev) => [...prev, ...newRes.items]);
        }
        setLoadingFetchMore(false);
      } else {
        setLoadingFetchMore(false);
        setFinished(true);

        return console.log('no more results');
      }
    });
  }, [cursor, fetchMore, query2, isExplore]);

  const handleLoadMoreWithTags = useCallback(() => {
    setLoadingFetchMore(true);

    fetchMore({
      variables: {
        request: {
          ...query2,
          cursor
        }
      },
      updateQuery: (prev, { fetchMoreResult }): any => {
        if (!fetchMoreResult) {
          return 'no more results';
        }

        const feedResult = {
          feed: {
            ...fetchMoreResult.feed
          }
        };

        const explorePublicationsResult = {
          explorePublications: {
            // @ts-ignore
            ...fetchMoreResult.explorePublications
          }
        };

        return isExplore ? explorePublicationsResult : feedResult;
      }
    })
      .then((res) => {
        // @ts-ignore
        const feedItems = res.data?.explorePublications?.items?.length > 0;
        const exploreItems = res.data?.feed?.items?.length > 0;

        if (feedItems || exploreItems) {
          const { next } = res.data?.feed?.pageInfo ?? {};
          const newItems = res.data?.feed?.items ?? [];

          if (next) {
            setCursor(next);
          } else {
            console.log('no more results 1');
          }
          setPublications((prev) => [...prev, ...newItems]);
        } else {
          console.log('no more results 2');
        }
      })
      .catch((error) => {
        console.error('Unknown error reading publications:', error);
      })
      .finally(() => setLoadingFetchMore(false));
  }, [cursor, fetchMore, query2, isExplore]);

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
      <div className="my-8 flex justify-center">
        <Spinner h="10" w="10" />
      </div>
    );
  }

  return (
    <>
      <CustomHead title="Nata Social" content="" />

      {/* <Script
        async
        defer
        data-do-not-track="true"
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

      <Layout
        title={'Nata Social | Home'}
        pageDescription={'Home'}
        setIsExplore={setIsExplore}
        isExplore={isExplore}
        setSkipExplore={setSkipExplore}
        skipExplore={skipExplore}
        // clearFeed={clearFeed}
      >
        {isVisibleWL ? (
          <WhitelistScreen setIsVisibleWL={setIsVisibleWL} />
        ) : showWelcome ? (
          <WelcomePanel
            lensProfile={lensProfile}
            chain={chain}
            welcomeReady={welcomeReady} // para adentro
            setShowWelcome={setShowWelcome} // para que desde adentro mande modificacion
          />
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
                isLoading={loader}
              />
            </div>

            {/* publications */}
            <section className="px-4 pb-6">
              <ul
                className={cn(
                  'w-full rounded-b-lg pb-6',
                  viewCard !== ViewBy.CARD
                    ? 'flex flex-col gap-3'
                    : 'grid grid-cols-3 gap-5'
                )}
              >
                {publications.length > 0 ? (
                  publications.map((post, index) => {
                    return CardViewsMap[viewCard]({
                      post,
                      key: index,
                      refProp:
                        publications.length - 15 === index
                          ? lastPublicationRef
                          : null
                    });
                  })
                ) : loader ? (
                  <div
                    className={`mx-auto my-8 flex w-full justify-center ${
                      viewCard !== ViewBy.CARD ? 'col-span-1' : 'col-span-3'
                    }`}
                  >
                    <Spinner h="10" w="10" />
                  </div>
                ) : (
                  <div className="my-8">No results found 💤</div>
                )}
              </ul>
              {loadingFetchMore && (
                <div className="mx-auto mb-10 flex w-10 items-center justify-center ">
                  <Spinner h="10" w="10" />
                </div>
              )}
              {finished && <div className="my-8">No more results 🍃.</div>}
            </section>
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
