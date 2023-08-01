import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import { DotWave } from '@uiball/loaders';
import ImageProxied from './ImageProxied';
import ListImages from './ListImages';
import ModalLists from './ModalLists';
import PostIndicators from '@components/PostIndicators';
import { PostProcessStatus } from '@lib/helpers';
import { ProfileContext } from './LensAuthenticationProvider';
import { Spinner } from './Spinner';
import TurndownService from 'turndown';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { doesFollow } from '@lib/lens/does-follow';
import { freeUnfollow } from '@lib/lens/free-unfollow';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { proxyActionFreeFollow } from '@lib/lens/follow-gasless';
import { useDisconnect } from 'wagmi';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { followers } from '@lib/lens/followers';
import { sendNotification } from '@lib/lens/user-notifications';
import { NotificationTypes } from '@models/notifications.models';
import { NOTIFICATION_TYPE } from '@pushprotocol/restapi/src/lib/payloads';

interface Props {
  post: any;
  refProp?: any;
}

const ExploreCard: FC<Props> = (props) => {
  const { post } = props;
  const isList =
    post.metadata.attributes.length > 0 &&
    (post.metadata.attributes[0].value === 'list' ||
      post.metadata.attributes[0].value === 'privateDefaultList');

  const { profile: lensProfile } = useContext(ProfileContext);
  const [openReconnect, setOpenReconnect] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const snackbar = useSnackbar();
  const [opacity, setOpacity] = useState(1);
  const [pointerEvents, setPointerEvents] = useState<any>('all');
  const [isFollowing, setIsFollowing] = useState(post.profile.isFollowedByMe);
  const [isDotFollowing, setIsDotFollowing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState('Following');
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { disconnect } = useDisconnect();
  const fromHtml = new TurndownService();
  fromHtml.keep(['br', 'p', 'div']); // keep line breaks
  fromHtml.addRule('lineElementsToPlain', {
    filter: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content) => {
      const trimmedContent = content.replace(/\n+$/g, '');
      return trimmedContent + '\n';
    }
  });

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

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const handleOpenModal = (postId: string) => {
    setPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProcessStatus = (actualStatus: PostProcessStatus) => {
    if (
      actualStatus === PostProcessStatus.CREATING_LIST ||
      actualStatus === PostProcessStatus.COLLECTING_POST ||
      actualStatus === PostProcessStatus.ADDING_POST ||
      actualStatus === PostProcessStatus.INDEXING
    ) {
      setIsPosting(true);
    }

    if (actualStatus === PostProcessStatus.FINISHED) {
      setIsPosting(false);
      setIsFinished(true);
    }
    // TODO error-unauthenticated//
  };

  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  //handles debounce
  // useEffect(() => {
  //   const handleDebounce = setTimeout(() => {
  //     const bounceResult = lists
  //       .map((l: typeList) => l.name.toLowerCase())
  //       .includes(valueListName.toLowerCase());

  //     setIsListExistent(bounceResult);
  //     const filteredList = lists.filter((l: typeList) =>
  //       l.name.toLowerCase().includes(valueListName.toLowerCase())
  //     );

  //     setSelectedList(filteredList);
  //   }, 300); // Adjust this timeout value to your desired delay

  //   return () => {
  //     clearTimeout(handleDebounce); // This cleanup function will clear the timeout if the component is unmounted before it can execute
  //   };
  // }, [valueListName]);

  const handleRemove = (postId: string) =>
    hidePublication(postId).then((res) => {
      snackbar.showMessage('🗑️ Post removed successfully');
      setOpacity(0.3);
      setPointerEvents('none');
    });

  // const handleChangeListName = (event: React.ChangeEvent<HTMLInputElement>) =>
  //   setValueListName(event.target.value);

  // const refreshLists = async (profileId: string) => {
  //   const readProfile: ProfileQuery['profile'] = await queryProfile({
  //     profileId
  //   });
  //   const parsedLists = JSON.parse(
  //     readProfile?.attributes?.find(
  //       (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
  //     )?.value || `[]`
  //   );
  //   setLists(parsedLists);
  //   setSelectedList(parsedLists);
  // };

  // - if profile doesnt have a deflist on its profile.metadata >>>>  !profile.metadata.listArray.find(r=>r.name==='default')
  // - create the post list, post.attributes = attributes [ { postSubType = 'favsList' }, ... ]
  // - get the postId, and add it to the profile.metadata

  const handleFollow = async (profileId: string) => {
    setIsDotFollowing(true);
    if (showUnfollow === 'Unfollow') {
      return freeUnfollow(profileId).then((r) => {
        setIsFollowing(false);
        setIsDotFollowing(false);
      });
    } else {
      const listFollowers = await followers(lensProfile?.id);
      const listAddressByFollowers = listFollowers.items.map(
        (follower) => follower.wallet.address
      );
      if (lensProfile?.name) {
        sendNotification(
          post.profile.ownedBy,
          NotificationTypes.Followed,
          lensProfile.name,
          NOTIFICATION_TYPE.TARGETTED
        );
        if (listAddressByFollowers.length > 1) {
          sendNotification(
            listAddressByFollowers,
            NotificationTypes.Followed,
            lensProfile.name,
            NOTIFICATION_TYPE.SUBSET,
            post.profile.name
          );
        } else if (listAddressByFollowers.length === 1) {
          sendNotification(
            [listAddressByFollowers[0]],
            NotificationTypes.Followed,
            lensProfile.name,
            NOTIFICATION_TYPE.TARGETTED,
            post.profile.name
          );
        }
      }
      // return proxyActionFreeFollow(profileId).then(async () => {
      //   /* Send Notification for followers and target profile: follow to */
      //   setIsFollowing(true);
      //   setIsDotFollowing(false);
      // });
    }
  };

  useEffect(() => {
    const fetchProfileFollow = () =>
      doesFollow(post.profile.id, lensProfile?.ownedBy);

    if (showCard && lensProfile?.ownedBy) {
      fetchProfileFollow().then((r) => {
        setIsFollowing(r.follows);
      });
    }
  }, [showCard, lensProfile?.ownedBy]);

  return (
    <>
      <div
        key={post.id}
        className=" w-full px-1 duration-1000 animate-in
          fade-in-50
          xs:w-11/12
          sm:w-11/12
          md:w-6/12
          lg:w-6/12
          xl:w-6/12
          2xl:w-4/12
          3xl:w-3/12
          4xl:w-2/12"
        style={{ opacity, pointerEvents, height: '310px' }}
        ref={props?.refProp}
      >
        {openReconnect ? (
          <div className="mt-14 h-full text-center ">
            <p className="my-4 text-2xl">⛔️</p>
            <p className="my-4 ">You were logged out</p>
            <button
              onClick={handleDisconnect}
              className=" bg-lensGreen px-3 py-2"
            >
              Connect!
            </button>
          </div>
        ) : (
          <article>
            {/* favllect content goes here */}
            <ModalLists
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              postId={postId}
              postTitle={post.metadata.name}
              processStatus={handleProcessStatus}
              ownedBy={post.profile.ownedBy}
              isList={isList}
            />

            {/* main tab contents goes here */}
            <div className="lens-post relative p-4">
              {/* card contents */}
              <div className="flex justify-between pb-3 text-sm text-black">
                {/* profile */}
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className=" relative flex"
                >
                  {/* profile header */}
                  <div className="inline-block cursor-pointer">
                    <div className="items-center rounded font-semibold text-gray-700">
                      <ImageProxied
                        category="profile"
                        alt={`Pic from ${post.profile.picture?.original?.url}`}
                        height={40}
                        width={40}
                        className="h-8 w-8 cursor-pointer rounded-full object-cover"
                        src={post.profile.picture?.original?.url}
                      />
                    </div>
                  </div>

                  <a
                    rel="noreferrer"
                    href={`/profile/${post.profile.id}`}
                    target="_blank"
                  >
                    <div className="flex justify-between">
                      <div className="pl-2 align-baseline text-xs">
                        <div className="flex">
                          {(post.profile.name || post.profile.id).trim() || '-'}
                          <p
                            style={{ fontSize: 10 }}
                            className="pl-1   text-gray-500"
                          >
                            • {moment(post.createdAt).fromNow()}
                          </p>
                        </div>
                        <p className="font-light text-gray-400">
                          @{post.profile.handle}
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* profile hover */}
                  {showCard && (
                    <div
                      className="lens-post  
                      absolute top-5 z-10 
                     w-64 shadow-xl  duration-500 animate-in fade-in-50 "
                    >
                      <div className="items-center rounded p-4 font-semibold text-gray-700">
                        <div className="flex justify-between bg-white">
                          <a
                            rel="noreferrer"
                            href={`/profile/${post.profile.id}`}
                            target="_blank"
                          >
                            <ImageProxied
                              category="profile"
                              alt={`Loading from ${post.profile.picture?.original?.url}`}
                              height={80}
                              width={80}
                              className="h-14 w-14 cursor-pointer rounded-full object-cover"
                              src={post.profile.picture?.original?.url}
                            />
                          </a>
                          {isFollowing ? (
                            <button
                              onMouseEnter={() => setShowUnfollow('Unfollow')}
                              onMouseLeave={() => setShowUnfollow('Following')}
                              onClick={() => handleFollow(post.profile.id)}
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
                              onClick={() => handleFollow(post.profile.id)}
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
                          href={`/profile/${post.profile.id}`}
                          target="_blank"
                        >
                          <p className="text-base font-bold">
                            {post.profile.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            @{post.profile.handle}
                          </p>
                          <p className="my-2 truncate text-ellipsis text-xs text-stone-500">
                            {post.profile.bio}
                          </p>
                        </a>
                        <div className="mt-3 flex justify-between rounded-lg bg-stone-100 px-3 py-2 font-serif">
                          <div className="flex">
                            <span>
                              {post.profile.stats.totalFollowing || 0}
                            </span>
                            <span className="ml-1 text-sm"> Following</span>
                          </div>
                          <div className="flex items-baseline">
                            <span>
                              {post.profile.stats.totalFollowers || 0}
                            </span>
                            <span className="ml-1 text-sm">Followers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* card menu */}
                <div
                  id="cardMenu"
                  className="dropdown relative inline-block cursor-pointer"
                >
                  <div className="items-center rounded py-2 font-semibold text-gray-700">
                    <ImageProxied
                      category="profile"
                      src="/assets/icons/dots-vertical.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>

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

                    <p className="">
                      {lensProfile && post.profile.id === lensProfile.id && (
                        <span
                          className="whitespace-no-wrap flex rounded-b-lg bg-gray-50  px-4 py-2 hover:bg-red-300 hover:text-black"
                          onClick={() => handleRemove(post.id)}
                        >
                          Remove
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* <Link > */}
              <a
                rel="noreferrer"
                target="_blank"
                href={isList ? `/list/${post.id}` : `/post/${post.id}`}
              >
                {isList ? (
                  <div>
                    <div className="relative">
                      <ListImages postId={post.id} />
                      <div
                        className="absolute bottom-0 z-0 flex w-full items-center p-2"
                        style={{
                          background: 'rgba(248, 248, 248, 0.7)',
                          backdropFilter: 'blur(7px)',
                          borderRadius: '0px 0px 8px 8px'
                        }}
                      >
                        <svg
                          width="14"
                          height="10"
                          viewBox="0 0 14 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.33366 1H12.3337M4.33366 5H12.3337M4.33366 9H12.3337M1.66699 1H1.66766M1.66699 5H1.66766M1.66699 9H1.66766"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="ml-1  font-serif text-xs">
                          {post.stats.totalAmountOfComments}{' '}
                          {post.stats.totalAmountOfComments === 1
                            ? 'Element'
                            : 'Elements'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageProxied
                    category="post"
                    width={400}
                    height={200}
                    priority={true}
                    alt=""
                    className=" h-28 w-full rounded-lg object-cover duration-1000 animate-in fade-in-50"
                    src={post.metadata.media[0]?.original.url}
                  />
                )}

                {/* titles  */}
                <div
                  style={{
                    height: '75px'
                  }}
                  className="mt-1"
                >
                  <div
                    className="truncate text-ellipsis font-serif
                       text-sm"
                  >
                    {post.metadata.name === 'My private list' ? '🔒 ' : ''}
                    {post.metadata.name || 'untitled'}
                  </div>
                  <div
                    className=" mt-1
                       font-sans font-thin text-gray-700"
                    style={{
                      fontSize: '10px'
                    }}
                  >
                    {isList ? (
                      <br />
                    ) : (
                      (
                        <pre
                          className="overflow-hidden whitespace-pre-wrap font-sans"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {fromHtml.turndown(post.metadata.content)}
                        </pre>
                      ) || ' '
                    )}
                    <style>{`
                      ::-webkit-scrollbar {
                        width: 3px;
                      }
                      ::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.07);
                        border-radius: 5px;
                      }
                      ::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                      }
                      ::-webkit-scrollbar-track {
                        background-color: transparent;
                      }
                    `}</style>
                  </div>
                </div>
              </a>

              {/* comments and collect indicators */}
              <div className=" flex w-full items-center justify-between text-xs">
                <PostIndicators
                  collects={post.stats.totalAmountOfCollects}
                  comments={post.stats.totalAmountOfComments || 0}
                />

                {(isFinished || (lensProfile && post.hasCollectedByMe)) && (
                  // && post.metadata.attributes[0].value === 'post'
                  <div
                    title="You do own this item!"
                    className="flex cursor-default items-end rounded-md bg-teal-300 px-2 py-1 text-right text-xs font-bold "
                  >
                    Collected
                  </div>
                )}

                {!isFinished &&
                  !isPosting &&
                  lensProfile &&
                  !post.hasCollectedByMe && (
                    <button
                      onClick={() => {
                        handleOpenModal(post.id);
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
                        <span className="ml-2 mr-1 font-bold text-white ">
                          Collect
                        </span>
                      </div>
                    </button>
                  )}

                {isPosting && (
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
              </div>
              {/* comments and collect indicators */}
            </div>
          </article>
        )}
      </div>
    </>
  );
};

export default ExploreCard;
