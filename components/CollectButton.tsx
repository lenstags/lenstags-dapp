import { BookmarkIcon } from '@heroicons/react/24/outline';
import { DotWave } from '@uiball/loaders';
import { ProfileQuery } from '@lib/lens/graphql/generated';

const CollectButton = ({
  profile,
  postId,
  postHasCollectedByMe,
  isFinishedState,
  isPostingState,
  openModalHandler
}: {
  profile: ProfileQuery['profile'] | null;
  postId: string;
  postHasCollectedByMe: boolean;
  isFinishedState: boolean;
  isPostingState: boolean;
  openModalHandler: (postId: string) => void;
}) => {
  return (
    <>
      {(isFinishedState || (profile && postHasCollectedByMe)) && (
        // && post.metadata.attributes[0].value === 'post'
        <div
          title="You do own this item!"
          className="flex cursor-default items-end rounded-md bg-teal-300 px-2 py-1 text-right text-xs font-bold "
        >
          Collected
        </div>
      )}

      {!isFinishedState &&
        !isPostingState &&
        profile &&
        !postHasCollectedByMe && (
          <button
            onClick={() => {
              openModalHandler(postId);
            }}
            className="rounded-lg bg-black "
          >
            <div className="flex items-center px-2 py-1 text-xs font-bold">
              <BookmarkIcon color="white" height={14} width={14} />
              <span className="mx-1 text-white ">Collect</span>
            </div>
          </button>
        )}

      {isPostingState && (
        <div className="flex text-right">
          <div className=" flex items-center rounded-md bg-teal-100 px-2 py-1 text-xs ">
            <DotWave size={22} color="#000000" />
            <span className="ml-2">Collecting</span>
            <div className="relative ml-1 flex items-center">
              <div
                className={`absolute inset-0 m-auto h-1 w-1 animate-ping rounded-full border `}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectButton;
