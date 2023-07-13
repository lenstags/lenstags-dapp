import {
  APP_NAME,
  ATTRIBUTES_LIST_KEY,
  PUBLICATION_METADATA_VERSION
} from '@lib/config';
import { LayoutReading, ProfileContext } from 'components';
import {
  MetadataAttribute,
  PublicationMainFocus
} from '@lib/lens/interfaces/publication';
import { useContext, useEffect, useState } from 'react';

import DotWave from '@uiball/loaders/dist/components/DotWave';
import Image from 'next/image';
import ImageProxied from 'components/ImageProxied';
import { Metadata } from '@lib/lens/interfaces/publication';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import ModalLists from 'components/ModalLists';
import PostIndicators from 'components/PostIndicators';
import { PostProcessStatus } from '@lib/helpers';
import { Spinner } from 'components/Spinner';
import TagStrip from 'components/TagStrip';
import { commentGasless } from '@lib/lens/comment-gasless';
import { getComments } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';
import { typeList } from '@lib/lens/load-lists';
import { useRouter } from 'next/router';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { v4 as uuidv4 } from 'uuid';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { profile: loggedProfile } = useContext(ProfileContext);
  const ii: string = id as string;

  const [post, setPost] = useState<any>();
  const [lensProfile, setProfile] = useState<any>();
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [comment, setComment] = useState<string>();
  const [allComments, setAllComments] = useState<any>();
  const [coverURL, setCoverURL] = useState<any>();
  const [domainURL, setDomainURL] = useState<any>();

  // Code to be used for collecting later
  const snackbar = useSnackbar();
  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute: any) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);

  function createMarkup(innerHtml: string) {
    return { __html: innerHtml };
  }

  const refreshComments = async () => {
    const comments = await getComments(ii);
    setAllComments(comments);
    setIsSpinnerVisible(false);
    setComment('');
  };

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectStatus, setCollectStatus] = useState(PostProcessStatus.IDLE);
  const [postId, setPostId] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleOpenModal = (postId: string) => {
    setPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProcessStatus = (actualStatus: PostProcessStatus) => {
    setCollectStatus(actualStatus);
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

    // error-unauthenticated//
  };

  useEffect(() => {
    const fetchData = async () => {
      const postObject = await getPublication(id as string);
      const profileResult = await queryProfile({
        profileId: postObject?.profile.id
      });
      if (!profileResult) {
        return;
      }

      await refreshComments();
      setProfile(profileResult);
      setPost(postObject);

      if (postObject) {
        setCoverURL(postObject?.metadata?.media[0]?.original.url);
        if (
          postObject.metadata.attributes[1] &&
          postObject.metadata.attributes[1].value
        ) {
          setDomainURL(
            new URL(postObject.metadata.attributes[1].value).hostname
          );
        }
      }

      console.log('ooo ', postObject);
    };

    fetchData().catch(console.error);
  }, [id]);

  const profileUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  const handleComment = (comment: any) => {
    if (!comment) {
      return;
    }

    setIsSpinnerVisible(true);
    const attType: MetadataAttribute = {
      value: 'listLog', // FIXME
      displayType: MetadataDisplayType.string,
      key: 'commentType'
    };

    const commentMetadata: Metadata = {
      version: PUBLICATION_METADATA_VERSION,
      mainContentFocus: PublicationMainFocus.TEXT_ONLY,
      metadata_id: uuidv4(),
      name: 'Nata Social Comment™',
      description: 'you-are-the-owner',
      content: comment, // new Date().getTime().toString(),
      locale: 'en-US',
      attributes: [attType], // , attDate],
      appId: APP_NAME
    };

    //TODO: use with no gasless too
    return commentGasless(loggedProfile?.id, ii, commentMetadata).then(() => {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();

      const draftComment = {
        id: uuidv4(),
        profile: {
          picture: {
            // @ts-ignore
            original: { url: profileUrl }
          },
          name: loggedProfile?.name,
          handle: loggedProfile?.handle
        },
        createdAt: formattedDate,
        metadata: {
          content: comment
        }
      };
      const newAll = [draftComment, ...allComments];
      setAllComments(newAll);
      setIsSpinnerVisible(false);
      setComment('');
    });
  };

  const handleRemove = (postId: string) =>
    hidePublication(postId).then((res) => {
      snackbar.showMessage(
        '🗑️ Post removed successfully'
        // 'Undo', () => handleUndo()
      );
    });

  return (
    post && (
      <LayoutReading
        title={`${post.metadata.description} Nata Social | Post from ${lensProfile.name}`}
        pageDescription="Post"
        screen={true}
      >
        <div className="w-full pb-4">
          {/* cover */}
          <div
            style={{
              backgroundImage: `url(${coverURL})`
            }}
            className="mx-auto w-10/12 rounded-xl bg-cover bg-center pt-60 md:w-4/5"
          >
            <TagStrip tags={post.metadata.tags} postId={post.id} />
          </div>
          {/****/}
          {/* body */}
          <div className="mx-auto mt-5 w-10/12 md:w-4/5">
            <div className="flex justify-between font-serif text-4xl font-bold">
              <div>{post.metadata.name || 'untitled'}</div>

              {/* card menu */}
              <div className="dropdown relative inline-block cursor-pointer">
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

            {/* subtitle row*/}
            <div className="mt-4 flex items-center justify-between">
              {/* info */}
              <div className="flex items-center">
                <div className="items-center rounded font-semibold text-gray-700">
                  <ImageProxied
                    category="profile"
                    alt={`Pic from ${post.profile.picture?.original?.url}`}
                    height={24}
                    width={24}
                    className="h-8 w-8 cursor-pointer rounded-full object-cover"
                    src={post.profile.picture?.original?.url}
                  />
                </div>

                <p className="ml-2 text-base font-semibold">
                  {lensProfile?.name}
                </p>

                <p className="ml-2 text-base text-gray-500">
                  @{lensProfile?.handle}
                </p>

                <p className="ml-2 text-sm text-gray-500">
                  ∙ {moment(post.createdAt).format('MMM Do YY')}
                </p>

                <p className="ml-2 text-sm text-gray-400">
                  {post.metadata.attributes[1]?.value && (
                    <div className="flex items-center">
                      ∙ Published in
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1  flex items-center"
                        href={post.metadata.attributes[1]?.value}
                      >
                        {domainURL}&nbsp;
                        <Image
                          src="/icons/url.svg"
                          alt="Url"
                          height={14}
                          width={14}
                        />
                      </a>
                    </div>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
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

                {/* collect zone */}
                <div className="flex items-center">
                  {/* favllect content goes here */}
                  <ModalLists
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    postId={postId}
                    processStatus={handleProcessStatus}
                  />
                </div>
              </div>
            </div>

            {/* contents area*/}
            <div className="mb-6">
              {/* abstract */}
              {post.metadata.description ? (
                <p className=" mt-6 border-l-4 border-double py-3 pl-8 font-mono text-gray-500">
                  {post.metadata.description}
                </p>
              ) : (
                ''
              )}

              <div
                className=" mb-8 py-8 "
                dangerouslySetInnerHTML={createMarkup(
                  post.metadata.content || 'no-contents'
                )}
              ></div>
            </div>

            {/* comments section  */}
            <div className=" ">
              <p>Comments</p>

              <div className="">
                <div className=" flex bg-white py-4 ">
                  <input
                    type="text"
                    autoComplete="off"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 
                   bg-stone-100  px-3 py-1 
                      leading-none  outline-none"
                    name="tag-search-input"
                    id="tag-search-input"
                    placeholder="Add your comment..."
                  />

                  {isSpinnerVisible ? (
                    <button className="ml-3 rounded-lg  bg-stone-400 px-3 py-2 text-white">
                      <div className="flex items-center">
                        <span className="mr-1">Sending</span>
                        <DotWave size={22} color="#FFFFFF" />
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComment(comment)}
                      className="ml-3 rounded-lg  bg-black px-3 py-2 text-white"
                    >
                      <div className="flex items-center">
                        <span className="mr-1">Send</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.00038 9.00013H9.00038M4.73057 8.51449L1.57019 2.82579C1.09271 1.96633 2.01216 1.00602 2.89156 1.44572L16.2115 8.1057C16.9486 8.47423 16.9486 9.52603 16.2115 9.89456L2.89156 16.5545C2.01216 16.9942 1.09271 16.0339 1.57019 15.1745L4.73057 9.48577C4.89836 9.18375 4.89836 8.81651 4.73057 8.51449Z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                {/* other comments */}
                {allComments &&
                  allComments.map((c: any) => {
                    return (
                      <div
                        key={c.id}
                        className=" mb-2 rounded-xl bg-stone-100 px-4 py-2"
                      >
                        <div className=" flex items-center">
                          <ImageProxied
                            category="profile"
                            // title={`Loading from ${c.profile.picture?.original?.url}`}
                            alt="Profile"
                            height={40}
                            width={40}
                            className="mr-2 h-8 w-8 cursor-pointer  rounded-full object-cover"
                            src={c.profile.picture?.original?.url}
                          />
                          <div className="">
                            <div className="text-sm">{c.profile.name}</div>
                            <div className="flex text-gray-400">
                              <div className="text-xs">{c.profile.handle}</div>
                              <div className="text-xs">
                                &nbsp;• {moment(c.createdAt).fromNow()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-10 mt-2 text-sm">
                          {c.metadata.content}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </LayoutReading>
    )
  );
}
