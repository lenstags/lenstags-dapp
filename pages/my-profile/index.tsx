import { Layout, ProfileContext, TagsFilter } from 'components';
import { Profile, PublicationTypes } from '@lib/lens/graphql/generated';
import { useContext, useEffect, useState } from 'react';

import { APP_NAME } from '@lib/config';
import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { getPublications } from '@lib/lens/get-publications';
import { queryProfile } from '@lib/lens/dispatcher';

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
      setPublications(
        res.items.filter(
          (r) =>
            r.profile.id === lensProfile?.id &&
            r.metadata.attributes[0].value === 'post'
        )
      ); // TODO PAGINATION CURSOR
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
      setPublications(res.items.filter((i) => i.appId === APP_NAME)); // TODO PAGINATION CURSOR
    };

    const fetchMyLists = async () => {
      const res = await getPublications(
        [PublicationTypes.Post],
        lensProfile.id
      );
      setPublications(
        res.items.filter(
          (r) =>
            (r.profile.id === lensProfile?.id &&
              r.metadata.attributes[0].value === 'list') ||
            r.metadata.attributes[0].value === 'privateDefaultList' // FIXME internalPublicationType
          //     .attributes?.find((attribute) => attribute.key === 'internalPublicationType')?.value || '',
        )
      ); // TODO PAGINATION CURSOR
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
        (i) => i.appId === APP_NAME
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

  return (
    <Layout
      title="Nata Social | Explore"
      pageDescription="My profile"
      screen={true}
    >
      <div className="w-full">
        {/* header */}

        <div
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent, white), url('${lensProfile?.coverPicture?.original?.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="pt-40"
        >
          <div className="xs:mx-4 flex items-center sm:mx-4 md:mx-20 lg:mx-44 xl:mx-44">
            <div
              className="relative   items-center  rounded-full bg-white pt-1 text-center"
              style={{ height: 130, width: 130 }}
            >
              <ImageProxied
                className="absolute rounded-full"
                category="profile"
                height={120}
                width={120}
                objectFit="cover"
                src={pictureUrl}
                alt="avatar"
              />
            </div>
            <div className="ml-6">
              <p className="mb-1 text-2xl font-semibold">{lensProfile?.name}</p>
              <p className="mb-2 font-light">@{lensProfile?.handle}</p>
              <div className="flex text-xs">
                <div className="rounded-lg bg-black px-3 py-1 text-center text-white">
                  <Link href={'/settings'}>Settings</Link>
                </div>
                <div className="ml-2 rounded-lg bg-black px-3 py-1 text-center text-white">
                  ...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" py-6 sm:mx-4 md:mx-20 lg:mx-44  xl:mx-44">
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
      <div className=" mx-auto w-11/12 md:w-4/5  ">
        <div className="  flex flex-wrap  ">
          {publications
            ? publications.map((post, index) => (
                <ExplorerCard post={post} key={index} />
              ))
            : null}
        </div>
      </div>
    </Layout>
  );
};

export default MyProfile;
