import { PublicationSearchType } from '@components/SearchBar';
import ImageProxied from '@components/ImageProxied';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import PostIndicators from '@components/PostIndicators';
import Link from 'next/link';
import CollectButton from '@components/CollectButton';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { useRef, useState } from 'react';
import HoverProfileCard from '@components/HoverProfileCard';

export const ResultsCard = ({
  publication,
  profile,
  isFinishedState,
  isPostingState,
  openModalHandler
}: {
  publication: PublicationSearchType;
  profile: ProfileQuery['profile'] | null;
  isFinishedState: boolean;
  isPostingState: boolean;
  openModalHandler: (postId: string) => void;
}) => {
  const [showCard, setShowCard] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutId.current = setTimeout(() => {
      setShowCard(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    setShowCard(false);
  };

  return (
    <div className="flex flex-col min-w-full border-4 border-stone-100 min-h-[200px] rounded-xl pt-3 pb-8 px-4">
      <div className="flex min-w-full justify-between items-center">
        <div className="flex items-center space-x-2 mb-4">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative cursor-pointer"
          >
            <ImageProxied
              category="profile"
              alt="Profile picture"
              width={40}
              height={40}
              src={publication.profilePicture}
              className="w-10 h-10 rounded-full object-cover"
            />
            <HoverProfileCard
              profile={profile}
              postProfileId={publication.profileId}
              postProfileIsFollowedByMe={publication.isFollowedByMe}
              postProfilePicture={publication.profilePicture}
              postProfileName={publication.profileName}
              postProfileHandle={publication.profileHandle}
              postProfileBio={publication.profileBio}
              postProfileTotalFollowing={publication.profileTotalFollowing}
              postProfileTotalFollowers={publication.profileTotalFollowers}
              showCardStatus={showCard}
            />
          </div>
          <span className="font-semibold">{publication.profileName}</span>
          <span className="text-gray-400">@{publication.profileHandle}</span>
          <span className="text-sm text-gray-500">
            • {moment(publication.createdAt).fromNow()}
          </span>
        </div>
        <div
          id="cardMenu"
          className="dropdown relative inline-block cursor-pointer"
        >
          <EllipsisHorizontalIcon className="w-6 h-6 mb-4" />
          <div
            className="dropdown-menu absolute right-1 top-6 z-10 hidden rounded-lg border-2
          border-gray-200 
          bg-gray-50 text-lensBlack shadow-lg shadow-gray-400 "
          >
            <p className="">
              <span
                className="whitespace-no-wrap block rounded-t-lg bg-gray-50 px-4 py-2 hover:bg-lensGreen hover:text-black"
                // href="#"
              >
                Share
              </span>
            </p>
            <p className="">
              <a
                className="whitespace-no-wrap block rounded-b-lg bg-gray-50 px-4 py-2 hover:bg-yellow-200 hover:text-black"
                href="#"
              >
                Report
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="flex">
        <ImageProxied
          category="post"
          src={publication.image}
          width={400}
          height={200}
          alt="Publication picture"
          className="max-w-[40%] min-w-[40%] max-h-[200px] rounded-xl mr-4 aspect-video object-cover"
        />
        <div className="flex flex-col justify-between grow">
          <Link
            href={`${publication.type}/${publication.id}`}
            className="flex flex-col"
          >
            <h3 className="font-bold text-xl mb-2">{publication.name}</h3>
            <p className="text-sm mb-2">{publication.content}</p>
          </Link>
          <div className="flex justify-between my-2">
            <div className="flex space-x-1">
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-[1px] border-black rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <PostIndicators
                collects={publication.totalAmountOfCollects.toString()}
                comments={publication.totalAmountOfComments.toString()}
              />
              <CollectButton
                profile={profile}
                postId={publication.id}
                postHasCollectedByMe={publication.hasCollectedByMe}
                isFinishedState={isFinishedState}
                isPostingState={isPostingState}
                openModalHandler={openModalHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
