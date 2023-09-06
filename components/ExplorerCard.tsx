import {
  PostProcessStatus,
  getPictureUrl,
  markdownToHTML
} from 'utils/helpers';
import React, { FC, useContext, useRef, useState } from 'react';

import CollectButton from './CollectButton';
import HoverProfileCard from './HoverProfileCard';
import ImageProxied from './ImageProxied';
import ListImages from './ListImages';
import ModalLists from './ModalLists';
import { PRIVATE_LIST_NAME } from '@lib/config';
import PostIndicators from '@components/PostIndicators';
// import ProfileCard from './ProfileCard';
import { ProfileContext } from './LensAuthenticationProvider';
import TurndownService from 'turndown';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import useDisconnector from '@lib/hooks/useDisconnector';
import { useSnackbar } from 'material-ui-snackbar-provider';

interface Props {
  post: any;
  refProp?: any;
}

const ExplorerCard: FC<Props> = (props) => {
  const { post } = props;
  const isList =
    post.metadata &&
    post.metadata.attributes.length > 0 &&
    (post.metadata.attributes[0].value === 'list' ||
      post.metadata.attributes[0].value === 'privateDefaultList');

  const { profile: lensProfile } = useContext(ProfileContext);
  const [openReconnect, setOpenReconnect] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const snackbar = useSnackbar();
  const [opacity, setOpacity] = useState(1);
  const [pointerEvents, setPointerEvents] = useState<any>('all');
  const [isFinished, setIsFinished] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const { handleDisconnect } = useDisconnector();

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  // markdown conversion
  // const fromHtml = new TurndownService();
  // fromHtml.keep(['br', 'p', 'div']); // keep line breaks
  // fromHtml.addRule('lineElementsToPlain', {
  //   filter: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  //   replacement: (content) => {
  //     const trimmedContent = content.replace(/\n+$/g, '');
  //     return trimmedContent + '\n';
  //   }
  // });

  const fromHtml = new TurndownService();
  fromHtml.keep(['br']); // solo mantén los saltos de línea
  fromHtml.addRule('headers', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => {
      const level = Number(node.nodeName.charAt(1));
      return `${'#'.repeat(level)} ${content}\n`;
    }
  });

  fromHtml.addRule('lineElementsToPlain', {
    filter: ['div', 'p'],
    replacement: (content) => {
      return content + '\n\n'; // dos saltos de línea para el formato Markdown de párrafo
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

  return (
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
            post={post}
            processStatus={handleProcessStatus}
            ownedBy={post.profile?.ownedBy}
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
                      alt={`Pic from ${post.profile?.picture?.original?.url}`}
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
                <HoverProfileCard
                  profile={lensProfile}
                  postProfile={post.profile}
                  showCardStatus={showCard}
                />
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
                  {post.metadata.name === PRIVATE_LIST_NAME ||
                  post.metadata.name === 'My private list'
                    ? '🔒 '
                    : ''}
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
                    <div
                      className="markdown-plain h-10"
                      dangerouslySetInnerHTML={markdownToHTML(
                        post.metadata.content || 'no-contents'
                      )}
                    ></div>
                  )}
                  {/* <style>{`
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
                    `}</style> */}
                </div>
              </div>
            </a>

            {/* comments and collect indicators */}
            <div className=" flex w-full items-center justify-between text-xs">
              <PostIndicators
                collects={post.stats.totalAmountOfCollects}
                comments={post.stats.totalAmountOfComments || 0}
              />
              <CollectButton
                profile={lensProfile}
                post={{
                  id: post.id,
                  profile: post.profile,
                  metadata: post.metadata
                }}
                postId={post.id}
                postHasCollectedByMe={post.hasCollectedByMe}
                isFinishedState={isFinished}
                isPostingState={isPosting}
                openModalHandler={handleOpenModal}
              />
            </div>
            {/* comments and collect indicators */}
          </div>
        </article>
      )}
    </div>
  );
};

export default ExplorerCard;
