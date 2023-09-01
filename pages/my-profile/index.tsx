import { LayoutProfile, ProfileContext, TagsFilter } from 'components';
import { Profile, PublicationTypes } from '@lib/lens/graphql/generated';
import { useContext, useEffect, useState } from 'react';

import { APP_NAME } from '@lib/config';
import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { NextPage } from 'next';
import Image from 'next/image';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { getPublications } from '@lib/lens/get-publications';
import { queryProfile } from '@lib/lens/dispatcher';
import { MapPinIcon, LinkIcon } from '@heroicons/react/24/outline';

const MyProfile: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [tab, setTab] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();

  // const { tags } = useContext(TagsFilterContext);
  const [tags, setTags] = useState<string[]>([]);

  // const lp = useContext(ProfileContext);
  const { profile: lp } = useContext(ProfileContext);

  // set profile
  useEffect(() => {
    const fetchData = async () => {
      if (!lp) return;

      const profileResult = await queryProfile({ profileId: lp.id });
      if (!profileResult) return;

      const pic =
        profileResult.picture?.__typename === 'MediaSet'
          ? profileResult.picture?.original.url
          : profileResult.picture?.__typename === 'NftImage'
          ? profileResult.picture.uri
          : '/img/profilePic.png';

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
      // TODO PAGINATION CURSOR
    };

    const fetchMyLists = async () => {
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

      const res = await getPublications(
        [PublicationTypes.Post],
        undefined,
        lp?.ownedBy
      );
      console.log('RES ', res);
      // TODO LENS ISSUE: APPID MISMATCHES SOURCES PARAM
      setPublications(res.items.filter((i: any) => i.appId === APP_NAME)); // TODO PAGINATION CURSOR
    };

    const fetchAll = async () => {
      // my pubs+lists
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

      setPublications(mergedArray); // TODO PAGINATION CURSOR
    };

    if (tab === 'myposts') {
      fetchMyPosts();
    }

    if (tab === 'mycollects') {
      fetchMyCollects();
    }

    if (tab === 'mylists') {
      fetchMyLists();
    }

    if (tab === 'all') {
      fetchAll();
    }
  }, [tab, lensProfile?.id, tags]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

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
    <LayoutProfile title="Nata Social | Explore" pageDescription="My profile">
      <div className="w-full px-8">
        {/* header */}
        <div className="">
          <div
            style={{
              backgroundImage: `url('${lensProfile?.coverPicture?.original?.url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="min-h-[25vh] rounded-xl"
          ></div>
          <div className="flex justify-between items-center">
            <div className="mb-4 flex flex-col max-w-[50%]">
              <ImageProxied
                className="h-32 w-32 -mt-16 ml-4 rounded-full border-4 border-white object-cover"
                category="profile"
                height={144}
                width={144}
                src={pictureUrl}
                alt="avatar"
              />
              <div className="flex items-center mt-2">
                <span className="mb-1 text-2xl font-bold mr-1">
                  {lensProfile?.name}
                </span>
                <span className="mb-0.5 font-normal text-gray-600 text-lg">
                  @{lensProfile?.handle}
                </span>
              </div>
              <p className="font-medium mt-1">{lensProfile?.bio}</p>
              <div className="flex space-x-3 mt-4">
                {location !== '' && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-[#4D4D4D] ml-1 font-medium text-sm">
                      {location}
                    </span>
                  </div>
                )}
                {website !== '' && (
                  <>
                    <span>᛫</span>
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4" />
                      <Link
                        href={url}
                        className="text-[#008BFF] ml-1 font-medium text-sm"
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
                        className="text-[#008BFF] ml-1 font-medium text-sm"
                      >
                        @{twitter}
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <div className="flex bg-[#F8F8F8] rounded-lg self-start py-2 px-3 space-x-4 mt-4">
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
            <div className="rounded-lg px-4 py-1 mt-6 text-center font-bold text-sm self-start border-black border-2 hover:cursor-pointer">
              <Link href={'/settings'}>Edit Profile</Link>
            </div>
          </div>
        </div>

        <div className=" mx-4 py-6 sm:mx-6 ">
          <div className="flex space-x-2 text-sm text-black">
            <button
              onClick={() => setTab('all')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              All
            </button>

            <button
              onClick={() => setTab('myposts')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              My posts
            </button>

            <button
              onClick={() => setTab('mycollects')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              <div className="flex">
                <span className="">Collected</span>
              </div>
            </button>

            <button
              onClick={() => setTab('mylists')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              <div className="flex">
                <span className="">My lists</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* contents */}
      <div className="  w-full px-8">
        <div className="  flex flex-wrap  ">
          {publications
            ? publications.map((post, index) => (
                <ExplorerCard post={post} key={index} />
              ))
            : null}
        </div>
      </div>
    </LayoutProfile>
  );
};

export default MyProfile;
