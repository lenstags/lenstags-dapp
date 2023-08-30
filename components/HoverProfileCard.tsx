import ImageProxied from '@components/ImageProxied';
import { doesFollow } from '@lib/lens/does-follow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { PublicRoutes } from '@models/routes.model';
import { DotWave } from '@uiball/loaders';
import { useEffect, useState } from 'react';
import { ProfileProps } from './ProfileCard';
import { PublicationSearchType } from './SearchBar';

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
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowedByMe);
  const [showUnfollow, setShowUnfollow] = useState('Following');

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
        <div
          className="lens-post
                      absolute top-5 z-10
                     w-64 shadow-xl  duration-500 animate-in fade-in-50 "
        >
          <div className="items-center rounded p-4 font-semibold text-gray-700">
            <div className="flex justify-between bg-white">
              <a
                rel="noreferrer"
                href={`${PublicRoutes.PROFILE}/${id}`}
                target="_blank"
              >
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
              </a>
              {isFollowing ? (
                <button
                  onMouseEnter={() => setShowUnfollow('Unfollow')}
                  onMouseLeave={() => setShowUnfollow('Following')}
                  onClick={() => handleFollow(id)}
                  className=" m-2 flex items-center rounded-lg border border-solid
                               border-black bg-transparent px-2 py-1 font-bold"
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

              {!isFollowing ? (
                <button
                  onClick={() => handleFollow(id)}
                  className=" m-2 flex items-center rounded-lg border border-solid
                               border-black bg-transparent px-2 py-1 font-bold"
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
            <a
              rel="noreferrer"
              href={`${PublicRoutes.PROFILE}/${id}`}
              target="_blank"
            >
              <p className="text-base font-bold">{name || profileName}</p>
              <p className="text-xs text-stone-500">
                @{handle || profileHandle}
              </p>
              <p className="my-2 truncate text-ellipsis text-xs text-stone-500">
                {bio || profileBio}
              </p>
            </a>
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
