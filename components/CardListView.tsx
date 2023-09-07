import { PostProcessStatus, markdownToHTML } from 'utils/helpers';
import React, { FC, useContext, useRef, useState } from 'react';

import CollectButton from './CollectButton';
import HoverProfileCard from './HoverProfileCard';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import ListImages from './ListImages';
import ModalLists from './ModalLists';
import { PRIVATE_LIST_NAME } from '@lib/config';
import PostIndicators from '@components/PostIndicators';
// import ProfileCard from './ProfileCard';
import { ProfileContext } from './LensAuthenticationProvider';
import { PublicRoutes } from '@models/routes.model';
import TagStrip from './TagStrip';
import TurndownService from 'turndown';
import { cn } from '@lib/utils';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { useDisconnect } from 'wagmi';
import { useSnackbar } from 'material-ui-snackbar-provider';

interface Props {
  post: any;
  refProp?: any;
}

const CardListView: FC<Props> = (props) => {
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
      className={cn('w-full  px-1 duration-1000 animate-in fade-in-50')}
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
        <article className="lens-post relative flex h-24 flex-col px-4 py-3">
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
          {/* <Link > */}
          <Link
            rel="noreferrer"
            href={isList ? `/list/${post.id}` : `/post/${post.id}`}
            className="flex h-12 items-center gap-2"
          >
            {isList ? (
              <ListBulletIcon className="h-5 w-5" />
            ) : (
              <ImageProxied
                category="post"
                width={200}
                height={200}
                priority={true}
                alt=""
                className="aspect-square w-10 rounded-lg object-cover duration-1000 animate-in fade-in-50"
                src={post.metadata.media[0]?.original.url}
              />
            )}

            {/* titles  */}
            <span className="truncate text-ellipsis font-serif text-xl font-bold">
              {post.metadata.name === PRIVATE_LIST_NAME ||
              post.metadata.name === 'My private list'
                ? '🔒 '
                : ''}
              {post.metadata.name || 'untitled'}
            </span>
          </Link>
          {/* card menu */}
          <div
            id="cardMenu"
            className="dropdown absolute right-4 inline-block cursor-pointer"
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
          {/* card contents */}
          <footer className="flex h-12 text-sm text-black">
            {/* profile */}
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative flex w-full items-center"
            >
              <Link
                rel="noreferrer"
                href={`${PublicRoutes.PROFILE}/${post.profile.id}`}
                className="mr-2 flex h-min w-auto gap-2 text-xs"
              >
                <span className="w-max">
                  {(post.profile.name || post.profile.id).trim() || '-'}
                </span>
                <span className="font-light text-gray-400">
                  @{post.profile.handle}
                </span>
                <span style={{ fontSize: 10 }} className="w-max text-gray-500">
                  • {moment(post.createdAt).fromNow()} •
                </span>
              </Link>
              <TagStrip tags={post.metadata.tags} postId={post.id} />
              {/* comments and collect indicators */}
              <div className="ml-auto flex h-min w-auto items-center justify-between text-xs">
                <PostIndicators
                  collects={post.stats.totalAmountOfCollects}
                  comments={
                    isList
                      ? (
                          parseInt(post.stats.totalAmountOfComments) - 1
                        ).toString()
                      : post.stats.totalAmountOfComments
                  }
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

              {/* profile hover */}
              <HoverProfileCard
                profile={lensProfile}
                postProfile={post.profile}
                showCardStatus={showCard}
              />
            </div>
          </footer>
        </article>
      )}
    </li>
  );
};

export default CardListView;
