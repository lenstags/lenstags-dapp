import { DotWave } from '@uiball/loaders';
import { Spinner } from './Spinner';
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
            className="  rounded-lg bg-black "
          >
            <div
              className="flex items-center px-2 py-1
                       text-xs "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 1C7.5 0.723858 7.27614 0.5 7 0.5C6.72386 0.5 6.5 0.723858 6.5 1L7.5 1ZM6.5 8.33333C6.5 8.60948 6.72386 8.83333 7 8.83333C7.27614 8.83333 7.5 8.60948 7.5 8.33333H6.5ZM10.0202 7.35355C10.2155 7.15829 10.2155 6.84171 10.0202 6.64645C9.82496 6.45118 9.50838 6.45118 9.31311 6.64645L10.0202 7.35355ZM7.4714 9.19526L7.11785 8.84171L7.4714 9.19526ZM6.5286 9.19526L6.88215 8.84171L6.5286 9.19526ZM4.68689 6.64645C4.49162 6.45118 4.17504 6.45118 3.97978 6.64645C3.78452 6.84171 3.78452 7.15829 3.97978 7.35355L4.68689 6.64645ZM1.5 9.66667C1.5 9.39052 1.27614 9.16667 1 9.16667C0.723858 9.16667 0.5 9.39052 0.5 9.66667H1.5ZM13.5 9.66667C13.5 9.39052 13.2761 9.16667 13 9.16667C12.7239 9.16667 12.5 9.39052 12.5 9.66667H13.5ZM11.908 12.782L11.681 12.3365H11.681L11.908 12.782ZM12.782 11.908L13.2275 12.135L12.782 11.908ZM1.21799 11.908L0.772484 12.135L1.21799 11.908ZM2.09202 12.782L1.86502 13.2275H1.86502L2.09202 12.782ZM6.5 1L6.5 8.33333H7.5L7.5 1L6.5 1ZM9.31311 6.64645L7.11785 8.84171L7.82496 9.54882L10.0202 7.35355L9.31311 6.64645ZM6.88215 8.84171L4.68689 6.64645L3.97978 7.35355L6.17504 9.54882L6.88215 8.84171ZM7.11785 8.84171C7.05276 8.9068 6.94724 8.9068 6.88215 8.84171L6.17504 9.54882C6.63065 10.0044 7.36935 10.0044 7.82496 9.54882L7.11785 8.84171ZM0.5 9.66667V9.8H1.5V9.66667H0.5ZM4.2 13.5H9.8V12.5H4.2V13.5ZM13.5 9.8V9.66667H12.5V9.8H13.5ZM9.8 13.5C10.3518 13.5 10.7957 13.5004 11.1543 13.4711C11.5187 13.4413 11.8388 13.3784 12.135 13.2275L11.681 12.3365C11.5493 12.4036 11.3755 12.4497 11.0729 12.4744C10.7645 12.4996 10.3683 12.5 9.8 12.5V13.5ZM12.5 9.8C12.5 10.3683 12.4996 10.7645 12.4744 11.0729C12.4497 11.3755 12.4036 11.5493 12.3365 11.681L13.2275 12.135C13.3784 11.8388 13.4413 11.5187 13.4711 11.1543C13.5004 10.7957 13.5 10.3518 13.5 9.8H12.5ZM12.135 13.2275C12.6054 12.9878 12.9878 12.6054 13.2275 12.135L12.3365 11.681C12.1927 11.9632 11.9632 12.1927 11.681 12.3365L12.135 13.2275ZM0.5 9.8C0.5 10.3518 0.499611 10.7957 0.528909 11.1543C0.558684 11.5187 0.62159 11.8388 0.772484 12.135L1.66349 11.681C1.5964 11.5493 1.55031 11.3755 1.52559 11.0729C1.50039 10.7645 1.5 10.3683 1.5 9.8H0.5ZM4.2 12.5C3.6317 12.5 3.23554 12.4996 2.92712 12.4744C2.62454 12.4497 2.45069 12.4036 2.31901 12.3365L1.86502 13.2275C2.16117 13.3784 2.48126 13.4413 2.84569 13.4711C3.20428 13.5004 3.6482 13.5 4.2 13.5V12.5ZM0.772484 12.135C1.01217 12.6054 1.39462 12.9878 1.86502 13.2275L2.31901 12.3365C2.03677 12.1927 1.8073 11.9632 1.66349 11.681L0.772484 12.135Z"
                  fill="white"
                />
              </svg>
              <span className="ml-2 mr-1 font-bold text-white ">Collect</span>
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
                className={`absolute inset-0 m-auto h-1 w-1 animate-ping
                                rounded-full border `}
              />
              <Spinner h="3" w="3" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectButton;
