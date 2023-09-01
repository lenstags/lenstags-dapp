import { LayoutProfile, ProfileContext, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import ImageProxied from 'components/ImageProxied';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';
import { MapPinIcon, LinkIcon } from '@heroicons/react/24/outline';
import { DotWave } from '@uiball/loaders';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';

const OtherProfile: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [publications, setPublications] = useState<any[]>([]);
  const [contentType, setContentType] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();
  const [isFollowing, setIsFollowing] = useState(lensProfile?.isFollowedByMe);
  const [showUnfollow, setShowUnfollow] = useState('Following');
  const [isDotFollowing, setIsDotFollowing] = useState(false);

  const handleFollow = async (profileId: string) => {
    setIsDotFollowing(true);
    if (showUnfollow === 'Unfollow') {
      return freeUnfollow(profileId).then((r) => {
        setIsFollowing(false);
        setIsDotFollowing(false);
      });
    } else {
      return proxyActionFreeFollow(profileId).then(() => {
        setIsFollowing(true);
        setIsDotFollowing(false);
      });
    }
  };

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
        data.items.filter((r: any) => r.profile.id === lensProfile?.id)
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

  explore({ locale: 'en', tags });
  return (
    <LayoutProfile title="Nata Social | Explore" pageDescription="Profile">
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
            {isFollowing && (
              <div
                onMouseEnter={() => setShowUnfollow('Unfollow')}
                onMouseLeave={() => setShowUnfollow('Following')}
                onClick={() => handleFollow(lensProfile.id)}
                className="rounded-lg px-4 py-1 mt-6 text-center font-bold text-sm self-start border-black border-2 hover:cursor-pointer"
              >
                {isDotFollowing ? (
                  <div className="mx-2">
                    <DotWave size={22} color="#000000" />
                  </div>
                ) : (
                  showUnfollow
                )}
              </div>
            )}
            {!isFollowing && (
              <div
                onClick={() => handleFollow(lensProfile.id)}
                className="rounded-lg px-4 py-1 mt-6 text-center font-bold text-sm self-start border-black border-2 hover:cursor-pointer"
              >
                {isDotFollowing ? (
                  <div className="mx-2">
                    <DotWave size={22} color="#000000" />
                  </div>
                ) : (
                  'Follow'
                )}
              </div>
            )}
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
    </LayoutProfile>
  );
};

export default OtherProfile;
