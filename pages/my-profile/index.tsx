import { Layout, ProfileContext, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';

const MyProfile: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [contentType, setContentType] = useState<any>('all');

  const { tags } = useContext(TagsFilterContext);
  const lensProfile = useContext(ProfileContext);

  useEffect(() => {
    explore({ tags }).then((data) => {
      if (contentType === 'collected') {
        setPublications(data.items.filter((r) => r.hasCollectedByMe));
        return;
      }

      if (contentType === 'created') {
        setPublications(
          data.items.filter((r) => r.profile.id === lensProfile?.id)
        );
        return;
      }

      if (contentType === 'all') {
        setPublications(
          data.items.filter(
            (r) => r.profile.id === lensProfile?.id || r.hasCollectedByMe
          )
        );
        return;
      }
    });
  }, [contentType, tags]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';
  explore({ tags });
  // explore({ tags }).then((data) => {
  //   setPublications(
  //     data.items.filter(
  //       (r) => r.profile.id === lensProfile?.id || r.hasCollectedByMe
  //     )
  //   );
  // });

  return (
    <Layout
      title="Lenstags | Explore"
      pageDescription="My profile"
      screen={true}
    >
      <div className="w-full">
        {/* header */}

        <div
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent, white), url('/img/back.png')",
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
              onClick={() => setContentType('all')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              All
            </button>

            <button
              onClick={() => setContentType('created')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              Created
            </button>

            <button
              onClick={() => setContentType('collected')}
              className="rounded-md border-2 border-solid border-black bg-white  px-2 text-center hover:bg-lensGreen"
            >
              <div className="flex">
                <span className="ml-1">Collected</span>
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
