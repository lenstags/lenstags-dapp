import { Layout, ProfileContext, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';

const OtherProfile: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [publications, setPublications] = useState<any[]>([]);
  const [contentType, setContentType] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const profileResult = await queryProfile({ profileId: id });
      if (!profileResult) {
        return;
      }
      setProfile(profileResult);
    };

    fetchData().catch(console.error);
  }, [id]);

  const { tags } = useContext(TagsFilterContext);
  //   const lensProfile = useContext(ProfileContext);

  useEffect(() => {
    explore({ locale: 'en', tags }).then((data) => {
      //   if (contentType === 'collected') {
      //     setPublications(
      //       data.items.filter((r) => r.profile.id !== lensProfile?.id)
      //     );
      //     return;
      //   }

      //   if (contentType === 'created') {
      setPublications(
        data.items.filter((r) => r.profile.id === lensProfile?.id)
      );
      return;
      //   }
    });
  }, [lensProfile?.id, tags]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  explore({ locale: 'en', tags });
  return (
    <Layout
      title="Nata Social | Explore"
      pageDescription="Profile"
      screen={true}
    >
      <div className="w-full px-6">
        {/* header */}
        <div
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent, white), url('${lensProfile?.coverPicture?.original?.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="pt-40"
        >
          <div className="flex items-center px-6">
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
              <p className="mb-2 text-sm font-light">@{lensProfile?.handle}</p>
              <p>{lensProfile?.bio}</p>

              <div className="my-2 flex text-xs">
                <div className=" rounded-lg bg-black px-3 py-1 text-center text-white">
                  ...
                </div>
              </div>

              <p className="mb-2 text-sm">Owned by: {lensProfile?.ownedBy}</p>
              <div className=" flex cursor-pointer space-x-8 text-xs ">
                <p> Followers: {lensProfile?.stats?.totalFollowers} </p>
                <p> Following: {lensProfile?.stats?.totalFollowing} </p>
                <p> Publications: {lensProfile?.stats?.totalPublications}</p>
              </div>
            </div>
          </div>
        </div>

        <div className=" py-6 sm:mx-4 md:mx-20 lg:mx-44  xl:mx-44">
          <div className="flex space-x-2 text-sm text-black">
            {/* <button
              onClick={() => setContentType('all')}
              className="rounded-md border-2 border-solid border-black  bg-white px-2 text-center"
            >
              All
            </button> */}

            <button
              onClick={() => setContentType('created')}
              className="  bg-white px-2 text-center"
            >
              {/* d by {lensProfile?.name} */}
            </button>

            {/* <button
              onClick={() => setContentType('collected')}
              className="rounded-md border-2 border-solid border-black  bg-white px-2 text-center"
            >
              <div className="flex">
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.277771 7.86972C0.277771 7.384 0.503542 7.38401 0.782044 7.38401H12.3965C12.6686 7.38401 13.002 7.1338 13.1612 7.34631C13.2786 7.50307 13.3889 7.74195 13.3889 7.86972V14.6697C13.3889 14.9379 13.1631 15.1554 12.8846 15.1554H0.782045C0.503542 15.1554 0.277771 14.9379 0.277771 14.6697 0.277771 14.66970.277771 14.6697 0.277771 8.35543 0.277771 7.86972Z"
                    fill="black"
                  />
                  <path
                    d="M2.18332 4.45742C2.18332 4.45742 0.402477 7.45917 0.364057 7.52393C0.325637 7.58869 0.374185 7.66927 0.451624 7.66927L2.1834 7.66926L3.13614 5.37507H4.31196L3.13611 3.99857C2.75501 3.6315 2.34212 4.15152 2.18332 4.45742Z"
                    fill="black"
                  />
                  <path
                    d="M11.7734 4.45741L12.5435 6.08408L13.3136 7.71074C13.3464 7.78006 13.2874 7.85713 13.2089 7.84739L11.7733 7.66925L10.8206 5.37507L9.64477 5.37507L10.8206 3.99856C11.2017 3.6315 11.6146 4.15152 11.7734 4.45741Z"
                    fill="black"
                  />
                  <path
                    d="M4.31198 2.97969L6.66526 5.50106L10.5208 1.27777"
                    stroke="black"
                    strokeWidth="1.25185"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ml-1">Collected</span>
              </div>
            </button> */}
          </div>
        </div>
      </div>

      {/* contents */}
      <div className="px-6">
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

export default OtherProfile;
