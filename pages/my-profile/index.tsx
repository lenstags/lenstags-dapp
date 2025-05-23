import { LinkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import {
  LayoutProfile,
  ProfileContext,
  TagsFilter,
  TagsFilterContext
} from 'components';
import { useContext, useEffect, useState } from 'react';
import { getCoverPictureUrl, getPictureUrl } from 'utils/helpers';

import { CardViewsMap } from '@components/CardViewButtons';
import {
  Filter,
  SortFilterControls,
  SortingValuesType
} from '@components/SortFilterControls';
import { Spinner } from '@components/Spinner';
import { useExplore } from '@context/ExploreContext';
import { ViewBy, ViewCardContext } from '@context/ViewCardContext';
import { APP_NAME } from '@lib/config';
import { queryProfile } from '@lib/lens/dispatcher';
import { getPublications } from '@lib/lens/get-publications';
import {
  PublicationSortCriteria,
  PublicationTypes
} from '@lib/lens/graphql/generated';
import { cn } from '@lib/utils';
import ImageProxied from 'components/ImageProxied';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const MyProfile: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [tab, setTab] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();
  const [loader, setLoader] = useState(false);
  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();

  const { tags } = useContext(TagsFilterContext);

  // const lp = useContext(ProfileContext);
  const { profile: lp } = useContext(ProfileContext);
  const { viewCard } = useContext(ViewCardContext);
  const [sortingValues, setSortingValues] = useState<SortingValuesType>({
    date: 'all',
    sort: PublicationSortCriteria.Latest,
    by: 'all'
  });
  const [filterValue, setFilterValue] = useState<Filter>(Filter.ALL);

  // set profile
  useEffect(() => {
    const fetchData = async () => {
      if (!lp) return;

      const profileResult = await queryProfile({ profileId: lp.id });
      if (!profileResult) return;

      // setPictureUrl(pic);
      setProfile(profileResult);
      console.log(' --------- profile ', profileResult);
      // window.localStorage.setItem(
      //   'LENS_PROFILE',
      //   JSON.stringify(profileResult)
      // );
      // setHydrationLoading(false);
    };
    fetchData().catch(console.error);
  }, [lp]);

  useEffect(() => {
    // My posts: post creados por mí --> getPublications(id)
    // My collects: items (listas o posts) collecteados--> Sean de terceros o mios
    // My lists: listas creadas por mí
    // All: creaciones+colecciones+lista default
    // creados x mi + collecteados x mi + mis listas

    if (!lensProfile) {
      return;
    }
    const fetchMyPosts = async () => {
      setLoader(true);
      const res = await getPublications(
        [PublicationTypes.Post],
        lensProfile.id
      );

      const filteredItems = res.items.filter((item: any) => {
        const id = lensProfile?.id;
        const attributes = item.metadata.attributes;
        return (
          item.profile.id === id &&
          attributes?.length > 0 &&
          attributes[0].value === 'post'
        );
      });

      setPublications(filteredItems);
      setLoader(false);
      // TODO PAGINATION CURSOR
    };

    const fetchMyLists = async () => {
      setLoader(true);
      const res = await getPublications(
        [PublicationTypes.Post],
        lensProfile.id
      );

      const filteredItems = res.items.filter((item: any) => {
        const id = lensProfile?.id;
        const attributes = item.metadata.attributes;
        return (
          item.profile.id === id &&
          attributes?.length > 0 &&
          (attributes[0].value === 'list' ||
            attributes[0].value === 'privateDefaultList')
        );
      });

      setPublications(filteredItems);
    };

    const fetchMyCollects = async () => {
      if (!lp) {
        return;
      }
      setLoader(true);
      const res = await getPublications(
        [PublicationTypes.Post],
        undefined,
        lp?.ownedBy
      );
      console.log('RES ', res);
      // TODO LENS ISSUE: APPID MISMATCHES SOURCES PARAM
      setPublications(res.items.filter((i: any) => i.appId === APP_NAME)); // TODO PAGINATION CURSOR
      setLoader(false);
    };

    const fetchAll = async () => {
      // my pubs+lists
      setLoader(true);
      const myPublications = await getPublications(
        [PublicationTypes.Post],
        lensProfile.id
      );
      // my collects
      const myCollects = await getPublications(
        [PublicationTypes.Post],
        undefined,
        lp?.ownedBy
      );
      const filteredCollects = myCollects.items.filter(
        (i: any) => i.appId === APP_NAME
      ); // TODO this is because sources!=appId

      const array1 = myPublications.items;
      const array2 = filteredCollects;
      const mergedArray = [...array1, ...array2].reduce(
        (a: any, b: any) => (a.some((o: any) => o.id === b.id) ? a : [...a, b]),
        []
      );
      if (tags.length > 0) {
        const filteredItems = mergedArray.filter((item: any) => {
          return item.metadata.tags.some((tag: any) => {
            return tags.includes(tag);
          });
        });
        setPublications(
          filteredItems.sort((a: any, b: any) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
        );
        setLoader(false);
      } else {
        setPublications(
          mergedArray.sort((a: any, b: any) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
        );
        setLoader(false);
      }
    };

    if (filterValue === Filter.POSTS) {
      fetchMyPosts();
    }

    if (filterValue === Filter.LISTS) {
      fetchMyLists();
    }

    if (filterValue === Filter.ALL) {
      fetchAll();
    }
  }, [lensProfile?.id, tags, filterValue]);

  const location =
    lensProfile?.attributes.find((item: any) => item.key === 'location')
      ?.value || '';

  const twitter =
    lensProfile?.attributes.find((item: any) => item.key === 'twitter')
      ?.value || '';

  const url =
    lensProfile?.attributes.find((item: any) => item.key === 'website')
      ?.value || '';

  let website = '';

  if (url !== '') {
    try {
      const parsedURL = new URL(url);

      website = parsedURL.hostname.replace(/^www\./, '');
    } catch (e) {
      website = url;
    }
  }

  return (
    <LayoutProfile
      title="Nata Social | Explore"
      pageDescription="My profile"
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      <div className="mb-4 flex w-full flex-col gap-4 px-8">
        {/* header */}
        <div className="">
          <div
            style={{
              backgroundImage: `url('${getCoverPictureUrl(lensProfile)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="min-h-[25vh] rounded-xl"
          ></div>
          <div className="flex items-center justify-between">
            <div className="flex max-w-[50%] flex-col">
              <ImageProxied
                className="-mt-16 ml-4 h-32 w-32 rounded-full border-4 border-white object-cover"
                category="profile"
                height={144}
                width={144}
                src={getPictureUrl(lensProfile)}
                alt="avatar"
              />
              <div className="mt-2 flex items-center">
                <span className="mb-1 mr-1 text-2xl font-bold">
                  {lensProfile?.name}
                </span>
                <span className="mb-0.5 text-lg font-normal text-gray-600">
                  @{lensProfile?.handle}
                </span>
              </div>
              <p className="mt-1 font-medium">{lensProfile?.bio}</p>
              <div className="mt-4 flex space-x-3">
                {location !== '' && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="ml-1 text-sm font-medium text-[#4D4D4D]">
                      {location}
                    </span>
                  </div>
                )}
                {website !== '' && (
                  <>
                    <span>᛫</span>
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4" />
                      <Link
                        href={url}
                        className="ml-1 text-sm font-medium text-[#008BFF]"
                      >
                        {website}
                      </Link>
                    </div>
                  </>
                )}
                {twitter !== '' && (
                  <>
                    <span>᛫</span>
                    <div className="flex items-center">
                      <Image
                        src="/icons/x-twitter.svg"
                        alt="Twitter icon"
                        height={16}
                        width={16}
                      />
                      <Link
                        href={`https://twitter.com/${twitter}`}
                        className="ml-1 text-sm font-medium text-[#008BFF]"
                      >
                        @{twitter}
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex space-x-4 self-start rounded-lg bg-[#F8F8F8] px-3 py-2">
                <span className="text-sm">
                  <span className="text-base font-medium">
                    {lensProfile?.stats.totalFollowing}
                  </span>{' '}
                  Following
                </span>
                <span className="text-sm">
                  <span className="text-base font-medium">
                    {lensProfile?.stats.totalFollowers}
                  </span>{' '}
                  Followers
                </span>
                <span className="text-sm">
                  <span className="text-base font-medium">
                    {lensProfile?.stats.totalCollects}
                  </span>{' '}
                  Collects
                </span>
              </div>
            </div>
            <div className="mt-6 self-start rounded-lg border-2 border-black px-4 py-1 text-center text-sm font-bold hover:cursor-pointer">
              <Link href={'/settings'}>Edit Profile</Link>
            </div>
          </div>
        </div>
        <TagsFilter className="mt-0" />
        <SortFilterControls
          sortingValues={sortingValues}
          setSortingValues={setSortingValues}
          sorting={false}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          isLoading={false}
        />
      </div>

      {/* contents */}
      <ul
        className={cn(
          'w-full rounded-b-lg px-8 pb-6',
          viewCard !== ViewBy.CARD
            ? 'flex flex-col gap-3'
            : 'grid grid-cols-3 gap-5 2xl:grid-cols-4'
        )}
      >
        {publications.length > 0 ? (
          publications.map((post, index) => {
            return CardViewsMap[viewCard]({
              post,
              key: index
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
    </LayoutProfile>
  );
};

export default MyProfile;
