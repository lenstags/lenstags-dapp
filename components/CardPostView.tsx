import { PostProcessStatus, markdownToHTML } from 'utils/helpers';
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
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { useDisconnect } from 'wagmi';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { cn } from '@lib/utils';
import Link from 'next/link';
import TagStrip from './TagStrip';

interface Props {
  post: any;
  refProp?: any;
}

const CardPostView: FC<Props> = (props) => {
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
  const [isFinished, setIsFinished] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { disconnect } = useDisconnect();

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

  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  const handleRemove = (postId: string) =>
    hidePublication(postId).then((res) => {
      snackbar.showMessage('🗑️ Post removed successfully');
      setOpacity(0.3);
      setPointerEvents('none');
    });

  return (
    <li
      key={post.id}
      className={cn(
        'h-full w-full px-1 duration-1000 animate-in fade-in-50'
        // ViewCardsStyle
      )}
      style={{ opacity, pointerEvents }}
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
        <article className="lens-post relative h-52 p-4">
          {/* main tab contents goes here */}
          {/* favllect content goes here */}
          <ModalLists
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            postId={postId}
            post={post}
            processStatus={handleProcessStatus}
            ownedBy={post.profile.ownedBy}
            isList={isList}
          />
          {/* card contents */}
          <div className="flex justify-between pb-3 text-sm text-black">
            {/* profile */}
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className=" relative flex"
            >
              {/* profile header */}
              <div className="inline-block cursor-pointer items-center rounded font-semibold text-gray-700">
                <ImageProxied
                  category="profile"
                  alt={`Pic from ${post.profile.picture?.original?.url}`}
                  height={40}
                  width={40}
                  className="h-9 w-9 cursor-pointer rounded-full object-cover"
                  src={post.profile.picture?.original?.url}
                />
              </div>

              <Link
                rel="noreferrer"
                href={`/profile/${post.profile.id}`}
                className="flex items-center justify-between gap-2 px-2 text-xs"
              >
                <span>
                  {(post.profile.name || post.profile.id).trim() || '-'}
                </span>
                <span className="font-light text-gray-400">
                  @{post.profile.handle}
                </span>
                <span style={{ fontSize: 10 }} className="text-gray-500">
                  • {moment(post.createdAt).fromNow()}
                </span>
              </Link>

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
              <div className="rotate-90 items-center rounded py-2 font-semibold text-gray-700">
                <ImageProxied
                  category="profile"
                  src="/assets/icons/dots-vertical.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </div>

              <div className="dropdown-menu absolute right-1 top-6 z-10 hidden rounded-lg border-2 border-gray-200 bg-gray-50 text-lensBlack shadow-lg shadow-gray-400 ">
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
          <figure className="flex w-full gap-4">
            <Link
              rel="noreferrer"
              href={isList ? `/list/${post.id}` : `/post/${post.id}`}
              className="min-w-fit"
            >
              {isList ? (
                <div className="max-w-56 relative">
                  <ListImages postId={post.id} className="w-56" />
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
              ) : (
                <ImageProxied
                  category="post"
                  width={400}
                  height={200}
                  priority={true}
                  alt=""
                  className="h-30 aspect-video w-56 rounded-lg object-cover duration-1000 animate-in fade-in-50"
                  src={post.metadata.media[0]?.original.url}
                />
              )}
            </Link>
            {/* titles  */}
            <div className="flex w-full flex-col justify-between">
              <Link
                rel="noreferrer"
                target="_blank"
                href={isList ? `/list/${post.id}` : `/post/${post.id}`}
                className="w-full"
              >
                <div className="w-[600px] truncate text-ellipsis font-serif text-xl font-bold">
                  {post.metadata.name === PRIVATE_LIST_NAME ||
                  post.metadata.name === 'My private list'
                    ? '🔒 '
                    : ''}
                  {post.metadata.name || 'untitled'}
                </div>
                <div
                  className="mt-1 w-full font-sans font-thin text-gray-700"
                  style={{
                    fontSize: '10px'
                  }}
                >
                  {isList ? (
                    <br />
                  ) : (
                    <div
                      className="markdown-plain h-24"
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
              </Link>
              <footer className="flex w-full justify-between">
                <TagStrip tags={post.metadata.tags} postId={post.id} />
                {/* comments and collect indicators */}
                <div className="flex w-min items-center text-xs">
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
              </footer>
            </div>
          </figure>
        </article>
      )}
    </li>
  );
};

export default CardPostView;
