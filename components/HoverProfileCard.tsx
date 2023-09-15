import { useContext, useEffect, useState } from 'react';

import { DotWave } from '@uiball/loaders';
import ImageProxied from '@components/ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { ProfileProps } from './ProfileCard';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { PublicRoutes } from '@models/routes.model';
import { PublicationSearchType } from './SearchBar';
import { doesFollow } from '@lib/lens/does-follow';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';

interface HoverProfileCardProps {
  profile: ProfileQuery['profile'] | null;
  showCardStatus: boolean;
  postProfile: Partial<PublicationSearchType & ProfileProps>;
}

const HoverProfileCard: React.FC<HoverProfileCardProps> = ({
  profile,
  showCardStatus,
  postProfile
}) => {
  const {
    id,
    isFollowedByMe,
    picture,
    name,
    handle,
    bio,
    stats,
    profileBio,
    profileHandle,
    profilePicture,
    profileName,
    profileTotalFollowing,
    profileTotalFollowers
  } = postProfile;
  const { profile: lensProfile } = useContext(ProfileContext);
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowedByMe);
  const [showUnfollow, setShowUnfollow] = useState('Following');

  const handleFollow = async (profileId: string) => {
    if (lensProfile?.id === id) return;
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
    const fetchProfileFollow = () => doesFollow(id, profile?.ownedBy);

    if (showCardStatus && profile?.ownedBy) {
      fetchProfileFollow().then((r) => {
        setIsFollowing(r.follows);
      });
    }
  }, [showCardStatus, profile?.ownedBy, id]);

  return (
    <>
      {showCardStatus && (
        <div className="lens-post absolute top-5 z-10 w-64 shadow-xl  duration-500 animate-in fade-in-50 ">
          <div className="items-center rounded p-4 font-semibold text-gray-700">
            <div className="flex justify-between bg-white">
              <Link rel="noreferrer" href={`${PublicRoutes.PROFILE}/${id}`}>
                <ImageProxied
                  category="profile"
                  alt={`Loading from ${
                    picture?.original.url || profilePicture
                  }`}
                  height={80}
                  width={80}
                  className="h-14 w-14 cursor-pointer rounded-full object-cover"
                  src={picture?.original.url || profilePicture}
                />
              </Link>
              {isFollowing && lensProfile && lensProfile.id !== id ? (
                <button
                  onMouseEnter={() => setShowUnfollow('Unfollow')}
                  onMouseLeave={() => setShowUnfollow('Following')}
                  onClick={() => handleFollow(id)}
                  className="m-2 flex items-center rounded-lg border border-solid border-black bg-transparent px-2 py-1 font-bold"
                >
                  {isDotFollowing ? (
                    <div className="mx-2">
                      <DotWave size={22} color="#000000" />
                    </div>
                  ) : (
                    showUnfollow
                  )}
                </button>
              ) : (
                ''
              )}

              {!isFollowing && lensProfile && lensProfile.id !== id ? (
                <button
                  onClick={() => handleFollow(id)}
                  className=" m-2 flex items-center rounded-lg border border-solid border-black bg-transparent px-2 py-1 font-bold"
                >
                  {isDotFollowing ? (
                    <div className="mx-2">
                      <DotWave size={22} color="#000000" />
                    </div>
                  ) : (
                    'Follow'
                  )}
                </button>
              ) : (
                ''
              )}
            </div>
            <Link rel="noreferrer" href={`${PublicRoutes.PROFILE}/${id}`}>
              <p className="text-base font-bold">{name || profileName}</p>
              <p className="text-xs text-stone-500">
                @{handle || profileHandle}
              </p>
              <p className="my-2 truncate text-ellipsis text-xs text-stone-500">
                {bio || profileBio}
              </p>
            </Link>
            <div className="mt-3 flex justify-between rounded-lg bg-stone-100 px-3 py-2 font-serif">
              <div className="flex">
                <span>
                  {stats?.totalFollowing || profileTotalFollowing || 0}
                </span>
                <span className="ml-1 text-sm"> Following</span>
              </div>
              <div className="flex items-baseline">
                <span>
                  {stats?.totalFollowers || profileTotalFollowers || 0}
                </span>
                <span className="ml-1 text-sm">Followers</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HoverProfileCard;
