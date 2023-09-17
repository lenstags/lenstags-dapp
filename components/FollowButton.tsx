import { useContext, useEffect, useState } from 'react';

import { ProfileContext } from './LensAuthenticationProvider';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { PublicationSearchType } from './SearchBar';
import { doesFollow } from '@lib/lens/does-follow';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { DotWave } from '@uiball/loaders';

interface Props {
  myProfileId: string;
  profileId: string;
  //   showCardStatus: boolean;
  //   postProfile: Partial<PublicationSearchType & ProfileProps>;
}

const FollowButton: React.FC<Props> = ({ myProfileId, profileId }) => {
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [followText, setFollowText] = useState('Follow');

  const handleFollow = async (profileId: string) => {
    if (myProfileId === profileId) {
      return;
    }

    setIsDotFollowing(true);

    return proxyActionFreeFollow(profileId).then(() => {
      setFollowText('Following');
      setIsDotFollowing(false);
    });
  };

  return (
    <>
      {myProfileId ? (
        <button
          onClick={() =>
            followText === 'Following' ? null : handleFollow(profileId)
          }
          className=" m-2 flex items-center rounded-lg border border-solid border-black bg-transparent px-2 py-1 font-bold"
        >
          {isDotFollowing ? (
            <div className="mx-2 my-1">
              <DotWave size={22} color="#000000" />
            </div>
          ) : (
            followText
          )}
        </button>
      ) : (
        <button
          disabled={true}
          className="m-2 flex items-center rounded-lg
          border border-solid border-gray-400 bg-transparent
          px-2 py-1 text-xs font-bold text-gray-400"
        >
          Connect to follow
        </button>
      )}
    </>
  );
};

export default FollowButton;
