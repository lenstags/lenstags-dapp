import { FC, useContext, useEffect, useState } from 'react';
import { Maybe, MediaSet, Profile } from '@lib/lens/graphql/generated';

import { DotWave } from '@uiball/loaders';
import ImageProxied from './ImageProxied';
import { NOTIFICATION_TYPE } from '@pushprotocol/restapi/src/lib/payloads';
import { NotificationTypes } from '@models/notifications.models';
import { ProfileContext } from './LensAuthenticationProvider';
import { doesFollow } from '@lib/lens/does-follow';
import { followers } from '@lib/lens/followers';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { sendNotification } from '@lib/lens/user-notifications';

export interface ProfileProps extends Profile {
  picture: Maybe<MediaSet>;
}

interface ProfileCardProps {
  profile: ProfileProps;
  showCard: boolean;
}

const ProfileCard: FC<ProfileCardProps> = ({ profile, showCard }) => {
  const { profile: lensProfile } = useContext(ProfileContext);
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState('Following');
  useEffect(() => {
    if (profile.isFollowedByMe) {
      setIsFollowing(true);
    }
    const fetchProfileFollow = () =>
      doesFollow(profile.id, lensProfile?.ownedBy);

    if (showCard && lensProfile?.ownedBy) {
      fetchProfileFollow().then((r) => {
        setIsFollowing(r.follows);
      });
    }
  }, [showCard, lensProfile?.ownedBy]);
  const handleFollow = async () => {
    setIsDotFollowing(true);
    if (showUnfollow === 'Unfollow') {
      return freeUnfollow(profile.id).then((r) => {
        setIsFollowing(false);
        setIsDotFollowing(false);
      });
    } else {
      return proxyActionFreeFollow(profile.id).then(async () => {
        /* Send Notification for followers and target profile: follow to */
        const listFollowers = await followers(lensProfile?.id);
        const listAddressByFollowers = listFollowers.items
          .map((follower) => follower.wallet.address)
          .filter((address) => address !== profile.ownedBy);
        if (lensProfile?.name) {
          sendNotification(
            profile.ownedBy,
            NotificationTypes.Followed,
            lensProfile.name,
            NOTIFICATION_TYPE.TARGETTED,
            undefined,
            lensProfile.id
          );
          if (listAddressByFollowers.length > 1) {
            sendNotification(
              listAddressByFollowers,
              NotificationTypes.Followed,
              lensProfile.name,
              NOTIFICATION_TYPE.SUBSET,
              profile.name ?? undefined,
              lensProfile.id
            );
          } else if (listAddressByFollowers.length === 1) {
            sendNotification(
              [listAddressByFollowers[0]],
              NotificationTypes.Followed,
              lensProfile.name,
              NOTIFICATION_TYPE.TARGETTED,
              profile.name ?? undefined,
              lensProfile.id
            );
          }
        }
        setIsFollowing(true);
        setIsDotFollowing(false);
      });
    }
  };
  return (
    <div className="lens-post absolute z-[200] w-64 shadow-xl duration-500 animate-in fade-in-50">
      <div className="items-center rounded p-4 font-semibold text-gray-700">
        <div className="flex justify-between bg-white">
          <a rel="noreferrer" href={`/profile/${profile.id}`} target="_blank">
            <ImageProxied
              category="profile"
              alt={`Loading from ${profile.picture?.original?.url}`}
              height={80}
              width={80}
              className="h-14 w-14 cursor-pointer rounded-full object-cover"
              src={profile.picture?.original?.url}
            />
          </a>
          {isFollowing ? (
            <button
              onMouseEnter={() => setShowUnfollow('Unfollow')}
              onMouseLeave={() => setShowUnfollow('Following')}
              onClick={handleFollow}
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
              onClick={handleFollow}
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
        <a rel="noreferrer" href={`/profile/${profile.id}`} target="_blank">
          <p className="text-base font-bold">{profile.name}</p>
          <p className="text-xs text-stone-500">@{profile.handle}</p>
          <p className="my-2 truncate text-ellipsis text-xs text-stone-500">
            {profile.bio}
          </p>
        </a>
        <div className="mt-3 flex justify-between rounded-lg bg-stone-100 px-3 py-2 font-serif">
          <div className="flex">
            <span>{profile.stats.totalFollowing || 0}</span>
            <span className="ml-1 text-sm"> Following</span>
          </div>
          <div className="flex items-baseline">
            <span>{profile.stats.totalFollowers || 0}</span>
            <span className="ml-1 text-sm">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
