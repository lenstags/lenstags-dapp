import { LayoutProfile, ProfileContext, TagsFilter } from 'components';
import { LinkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getCoverPictureUrl, getPictureUrl } from 'utils/helpers';
import { useContext, useEffect, useState } from 'react';

import { DotWave } from '@uiball/loaders';
import ExplorerCard from 'components/ExplorerCard';
import Image from 'next/image';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { queryProfile } from '@lib/lens/dispatcher';
import { useExplore } from '@context/ExploreContext';
import { useRouter } from 'next/router';

const OtherProfile: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [publications, setPublications] = useState<any[]>([]);
  const [contentType, setContentType] = useState<any>('all');
  const [lensProfile, setProfile] = useState<any>();
  const [isFollowing, setIsFollowing] = useState(lensProfile?.isFollowedByMe);
  const [showUnfollow, setShowUnfollow] = useState('Following');
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();
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
      if (data.__typename === 'ExplorePublicationResult') {
        setPublications(
          data.items.filter((r: any) => r.profile.id === lensProfile?.id)
        );
      }
      return;
      //   }
    });
  }, [lensProfile?.id, tags]);

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
    <LayoutProfile
      title="Nata Social | Explore"
      pageDescription="Profile"
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      <div className="w-full px-8">
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
            <div className="mb-4 flex max-w-[50%] flex-col">
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
            {isFollowing && (
              <div
                onMouseEnter={() => setShowUnfollow('Unfollow')}
                onMouseLeave={() => setShowUnfollow('Following')}
                onClick={() => handleFollow(lensProfile.id)}
                className="mt-6 self-start rounded-lg border-2 border-black px-4 py-1 text-center text-sm font-bold hover:cursor-pointer"
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
                className="mt-6 self-start rounded-lg border-2 border-black px-4 py-1 text-center text-sm font-bold hover:cursor-pointer"
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
