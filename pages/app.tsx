import { APP_NAME, LENSTAGS_SOURCE } from '@lib/config';
import {
  CustomFiltersTypes,
  ExplorePublicationsDocument,
  FeedEventItemType,
  FeedRequest,
  PaginatedFeedResult,
  ProfileFeedDocument,
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
import CardViewButtons, { CardViewsMap } from '@components/CardViewButtons';
import CustomHead from '@components/CustomHead';
import { SearchBar } from '@components/SearchBar';
import WelcomePanel from '@components/WelcomePanel';
import WhitelistScreen from '@components/WhitelistScreen';
import { useExplore } from '@context/ExploreContext';
import { ViewBy, ViewCardContext } from '@context/ViewCardContext';
import useCheckWhitelist from '@lib/hooks/useCheckWhitelist';
import { reqQuery } from '@lib/lens/explore-publications';
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
  const { viewCard } = useContext(ViewCardContext);
  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();

  const {
    checkWhitelist,
    isVisibleWL,
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
  }, [lensProfile, chain, checkWhitelist]);

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

  // useEffect(() => {
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

  // useEffect(() => {
  //   setLoader(loading);
  // }, [loading, resExplore]);

  // useEffect(() => {
  //   setLoader(loading);
  // }, [data]);

  // useEffect(() => {
  //   setLoader(loading);
  // }, [loading]);

  // useEffect(() => {
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
      <Script
        async
        defer
        src="https://analytics.umami.is/script.js"
        data-website-id="4b989056-b471-4b8f-a39f-d2621ddb83c2"
      ></Script>

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
          <WhitelistScreen />
        ) : showWelcome ? (
          <WelcomePanel
            chain={chain}
            welcomeReady={welcomeReady}
            setShowWelcome={setShowWelcome}
            lensProfile={lensProfile}
          />
        ) : (
          <>
            {/* top bar container*/}
            <div className="h-50 sticky top-0 z-10 w-full bg-white px-8 py-2 pt-4">
              {/* search bar */}
              <SearchBar />
              <TagsFilter />
            </div>

            {/* publications */}
            <section className="px-4 pb-6">
              <CardViewButtons />
              <ul
                className={cn(
                  'flex flex-wrap justify-center rounded-b-lg px-3 pb-6',
                  viewCard !== ViewBy.CARD && 'flex-col gap-3'
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
                  <div className="mx-auto my-8">
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
