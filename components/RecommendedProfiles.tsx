import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import { DotWave } from '@uiball/loaders';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { Profile } from '@lib/lens/graphql/generated';
import { ProfileContext } from './LensAuthenticationProvider';
import { getPictureUrl } from 'utils/helpers';
import { recommendedProfiles } from '@lib/lens/recommended-profiles';

const RecommendedProfiles: FC = () => {
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profiles, setProfiles] = useState<any>([]);
  const [showCard, setShowCard] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState('Following');

  //   useEffect(() => {
  //     if (profile.isFollowedByMe) {
  //       setIsFollowing(true);
  //     }
  //     const fetchProfileFollow = () =>
  //       doesFollow(profile.id, lensProfile?.ownedBy);

  //     if (showCard && lensProfile?.ownedBy) {
  //       fetchProfileFollow().then((r) => {
  //         setIsFollowing(r.follows);
  //       });
  //     }
  //   }, [showCard, lensProfile?.ownedBy, profile.id, profile.isFollowedByMe]);

  //   const handleMouseEnter = () => {
  //     timeoutId.current = setTimeout(() => {
  //       setShowCard(true);
  //     }, 600);
  //   };

  //   const handleMouseLeave = () => {
  //     if (timeoutId.current) {
  //       clearTimeout(timeoutId.current);
  //     }
  //     setShowCard(false);
  //   };

  const fetchData = async () => {
    // if (!lensProfile) return;
    const res = await recommendedProfiles();
    setProfiles(res);
    console.log('fetchData qqq ', res);
  };

  useEffect(() => {
    // lensProfile &&
    //   getSubscriptions(lensProfile?.ownedBy).then((res: any) => {
    //     const channelNataSocial =
    //       res &&
    //       !!res.find(
    //         (item: { channel: string }) =>
    //           item.channel === '0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3'
    //       );
    //     setSubscribed(channelNataSocial);
    //   });
    fetchData();
  }, []);

  return (
    <>
      <div className="mt-4 rounded-t-lg bg-stone-100 py-2 pr-4">
        <div className=" rounded-lg pl-4">
          <div className=" flex items-baseline justify-between">
            <p className="font-serif text-sm font-bold">Recommended creators</p>
            {/* <p className=" font-sans text-xs font-bold">View ranking</p> */}
          </div>
        </div>
      </div>
      <div className="mb-6 w-full rounded-b-lg border-2 border-solid border-stone-100 bg-white px-4 pb-4">
        {profiles &&
          profiles.map((profile: Profile) => {
            return (
              <div key={profile.id} className=" relative flex pt-3">
                {/* profile header */}
                <div className="inline-block cursor-pointer items-center rounded font-semibold text-gray-700">
                  <ImageProxied
                    category="profile"
                    // @ts-ignore
                    alt={`Pic from ${profile.picture?.original?.url}`}
                    height={40}
                    width={40}
                    className="h-9 w-9 cursor-pointer rounded-full object-cover"
                    // @ts-ignore
                    src={profile.picture?.original?.url}
                  />
                </div>
                <div className="flex">
                  <Link
                    rel="noreferrer"
                    href={`/profile/${profile.id}`}
                    className="px-2 text-xs"
                  >
                    <p className="text-xs ">
                      {(profile.name || profile.id).trim() || '-'}
                    </p>
                    <p className="text-xs font-normal text-gray-400">
                      @{profile.handle}
                    </p>
                  </Link>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default RecommendedProfiles;
