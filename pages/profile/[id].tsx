import { Layout, ProfileContext, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';
import { SortingValuesType } from '@components/SortFilterControls';
import { PublicationSortCriteria } from '@lib/lens/graphql/generated';

const OtherProfile: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [publications, setPublications] = useState<any[]>([]);
  const [contentType, setContentType] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();
  const [sortingValues, setSortingValues] = useState<SortingValuesType>({
    date: 'all',
    sort: PublicationSortCriteria.Latest,
    by: 'all'
  });

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
    explore({ locale: 'en', sortingValues, tags }).then((data) => {
      //   if (contentType === 'collected') {
      //     setPublications(
      //       data.items.filter((r) => r.profile.id !== lensProfile?.id)
      //     );
      //     return;
      //   }

      //   if (contentType === 'created') {
      setPublications(
        data.items.filter((r: any) => r.profile.id === lensProfile?.id)
      );
      return;
      //   }
    });
  }, [lensProfile?.id, tags, sortingValues]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  //explore({ locale: 'en', tags });
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
            <ImageProxied
              className="h-32 w-32 rounded-full border-2 border-white object-cover"
              category="profile"
              height={144}
              width={144}
              src={pictureUrl}
              alt="avatar"
            />
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
