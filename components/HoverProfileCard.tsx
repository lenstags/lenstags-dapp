import { useState, useEffect } from 'react';
import ImageProxied from '@components/ImageProxied';
import { DotWave } from '@uiball/loaders';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { doesFollow } from '@lib/lens/does-follow';
import { ProfileQuery } from '@lib/lens/graphql/generated';

const HoverProfileCard = ({
  profile,
  postProfileId,
  postProfileIsFollowedByMe,
  postProfilePicture,
  postProfileName,
  postProfileHandle,
  postProfileBio,
  postProfileTotalFollowing,
  postProfileTotalFollowers,
  showCardStatus
}: {
  profile: ProfileQuery['profile'] | null;
  postProfileId: string;
  postProfileIsFollowedByMe: boolean;
  postProfilePicture: string;
  postProfileName: string;
  postProfileHandle: string;
  postProfileBio: string;
  postProfileTotalFollowing: number;
  postProfileTotalFollowers: number;
  showCardStatus: boolean;
}) => {
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(postProfileIsFollowedByMe);
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
    const fetchProfileFollow = () =>
      doesFollow(postProfileId, profile?.ownedBy);

    if (showCardStatus && profile?.ownedBy) {
      fetchProfileFollow().then((r) => {
        setIsFollowing(r.follows);
      });
    }
  }, [showCardStatus, profile?.ownedBy]);

  return (
    <>
      {showCardStatus && (
        <div
          className="lens-post  
                      absolute top-5 z-10 
                     w-64 shadow-xl  animate-in fade-in-50 duration-500 "
        >
          <div className="items-center rounded p-4 font-semibold text-gray-700">
            <div className="flex justify-between bg-white">
              <a
                rel="noreferrer"
                href={`/profile/${postProfileId}`}
                target="_blank"
              >
                <ImageProxied
                  category="profile"
                  alt={`Loading from ${postProfilePicture}`}
                  height={80}
                  width={80}
                  className="h-14 w-14 cursor-pointer rounded-full object-cover"
                  src={postProfilePicture}
                />
              </a>
              {isFollowing ? (
                <button
                  onMouseEnter={() => setShowUnfollow('Unfollow')}
                  onMouseLeave={() => setShowUnfollow('Following')}
                  onClick={() => handleFollow(postProfileId)}
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
                  onClick={() => handleFollow(postProfileId)}
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
              href={`/profile/${postProfileId}`}
              target="_blank"
            >
              <p className="text-base font-bold">{postProfileName}</p>
              <p className="text-xs text-stone-500">@{postProfileHandle}</p>
              <p className="my-2 truncate text-ellipsis text-xs text-stone-500">
                {postProfileBio}
              </p>
            </a>
            <div className="mt-3 flex justify-between rounded-lg bg-stone-100 px-3 py-2 font-serif">
              <div className="flex">
                <span>{postProfileTotalFollowing || 0}</span>
                <span className="ml-1 text-sm"> Following</span>
              </div>
              <div className="flex items-baseline">
                <span>{postProfileTotalFollowers || 0}</span>
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
