import { Profile } from '@lib/lens/graphql/generated';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { getExploreProfiles } from '@lib/lens/explore-profiles';
import FollowButton from './FollowButton';
import { shuffleArray } from 'utils/helpers';

const RecommendedProfiles: FC = () => {
  const [profiles, setProfiles] = useState<any>([]);
  const { profile: loggedProfile } = useContext(ProfileContext);

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
