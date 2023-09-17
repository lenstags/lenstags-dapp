import {
  Profile,
  RecommendedProfilesDocument
} from '@lib/lens/graphql/generated';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import { DotWave } from '@uiball/loaders';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { getPictureUrl, shuffleArray } from 'utils/helpers';
import { recommendedProfiles } from '@lib/lens/recommended-profiles';
import { useQuery } from '@apollo/client';
import { useRecommendedProfilesQuery } from '@lib/lens/graphql/generated';
import { getExploreProfiles } from '@lib/lens/explore-profiles';
import FollowButton from './FollowButton';

const RecommendedProfiles: FC = () => {
  const [profiles, setProfiles] = useState<any>([]);
  const [showCard, setShowCard] = useState(false);
  const { profile: loggedProfile } = useContext(ProfileContext);

  //   const timeoutId = useRef<NodeJS.Timeout | null>(null);
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

  //   const resRecommendedProfiles = useQuery(RecommendedProfilesDocument, {
  //     variables: {
  //       options: {
  //         // disableML: true,
  //         shuffle: true // this does not work!
  //       }
  //     }
  //   });

  //   const { data, loading, error } = useRecommendedProfilesQuery({
  //     variables: {
  //       options: {
  //         profileId: null
  //       }
  //     }
  //   });

  //   const { data, loading, error: apolloError } = resRecommendedProfiles;

  //   const fetchData = async () => {
  //     // if (!lensProfile) return;
  //     const res = await recommendedProfiles();
  //     setProfiles(res);
  //     console.log('fetchData qqq ', res);
  //   };

  const fetchData = async (myProfileId?: string) => {
    const res = await getExploreProfiles(myProfileId);
    if (!res) {
      return;
    }
    const randomizedArray = shuffleArray(res);
    const firstFiveElements = randomizedArray.slice(0, 5);
    setProfiles(firstFiveElements);
  };

  useEffect(() => {
    fetchData(loggedProfile?.id);
  }, [loggedProfile]);

  return (
    <>
      <div className="mt-4 rounded-t-xl bg-stone-100 py-2 pr-4">
        <div className=" rounded-lg pl-4">
          <div className=" flex items-baseline justify-between">
            <p className="font-serif text-sm font-bold">Recommended creators</p>
            {/* <p className=" font-sans text-xs font-bold">View ranking</p> */}
          </div>
        </div>
      </div>
      <div className="mb-6 w-full rounded-b-xl border-2 border-solid border-stone-100 bg-white px-4 pb-4">
        {profiles &&
          profiles.map((profile: Profile) => {
            return (
              <div key={profile.id} className="relative flex pt-3">
                {/* profile header */}
                <div className="inline-block cursor-pointer items-center rounded font-semibold text-gray-700">
                  <ImageProxied
                    category="profile"
                    // @ts-ignore
                    alt={`Pic from ${profile.picture?.original?.url}`}
                    height={40}
                    width={40}
                    className="h-9 w-10 cursor-pointer rounded-full object-cover"
                    // @ts-ignore
                    src={profile.picture?.original?.url}
                  />
                </div>
                <div className="flex w-full items-center justify-between">
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

                  <FollowButton
                    myProfileId={loggedProfile?.id}
                    profileId={profile.id}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default RecommendedProfiles;
