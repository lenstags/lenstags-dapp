import {
  APP_NAME,
  ATTRIBUTES_LIST_KEY,
  PUBLICATION_METADATA_VERSION
} from '@lib/config';
import { Layout, ProfileContext } from 'components';
import {
  MetadataAttribute,
  PublicationMainFocus
} from '@lib/lens/interfaces/publication';
import { useContext, useEffect, useState } from 'react';

import DotWave from '@uiball/loaders/dist/components/DotWave';
import ImageProxied from 'components/ImageProxied';
import { Metadata } from '@lib/lens/interfaces/publication';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { Spinner } from 'components/Spinner';
import { commentGasless } from '@lib/lens/comment-gasless';
import { getComments } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';
import { typeList } from '@lib/lens/load-lists';
import { useDisconnect } from 'wagmi';
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

  const snackbar = useSnackbar();
  const [isListVisible, setIsListVisible] = useState(false);
  const [isFavMenuVisible, setFavMenuVisible] = useState(false);
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [comment, setComment] = useState<string>();
  const [allComments, setAllComments] = useState<any>();

  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute: any) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);
  const { disconnect } = useDisconnect();

  function createMarkup(innerHtml: string) {
    return { __html: innerHtml };
  }

  const refreshLists = async (profileId: string) => {
    const readProfile: ProfileQuery['profile'] = await queryProfile({
      profileId
    });
    const parsedLists = JSON.parse(
      readProfile?.attributes?.find(
        (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
      )?.value || `[]`
    );
    setLists(parsedLists);
    setSelectedList(parsedLists); // FIXME: should be only one?
  };

  const refreshComments = async () => {
    const comments = await getComments(ii);
    setAllComments(comments);
    console.log('refreshed all! ', comments);
    setIsSpinnerVisible(false);
    setComment('');
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
      console.log('ooo ', postObject);
    };

    fetchData().catch(console.error);
  }, [id]);

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
    return commentGasless(loggedProfile?.id, ii, commentMetadata).then(() =>
      refreshComments()
    );
  };

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  return (
    post && (
      <Layout
        title="Nata Social | Explore"
        pageDescription="Profile"
        screen={true}
      >
        <div className="w-full px-6  pb-4">
          {/* header */}
          <div
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent, white), url(${post.metadata.media[0]?.original.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="  "
          >
            <div
              style={{
                backgroundImage: `linear-gradient(to bottom, transparent, white), url(${post.metadata.media[0]?.original.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              className="mx-auto w-11/12  pt-60   md:w-4/5"
            >
              <div className="  flex items-center ">
                <ImageProxied
                  className=" rounded-full border-2 border-white object-cover"
                  category="profile"
                  height={64}
                  width={64}
                  src={pictureUrl}
                  alt="avatar"
                />
                <div className="ml-6">
                  <p className="mb-1 text-2xl font-semibold">
                    {lensProfile?.name}
                  </p>
                  <p className="mb-2 text-sm font-light">
                    @{lensProfile?.handle}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto  w-11/12  py-6 md:w-4/5">
            <div className="flex  text-sm text-black">
              <footer className="flex items-center  justify-between py-2 text-right text-black">
                {/* <span className="flex items-center text-xs ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-messages"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="#718096"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                    <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                  </svg>

                  {post.profile.stats?.totalComments || '0'}
                </span> */}

                <button
                  // onClick={() => {
                  //   refreshLists(lensProfile?.id);
                  //   return setFavMenuVisible(!isListVisible);
                  // }}
                  className="flex text-right"
                >
                  {/* {lensProfile ? (
                    // && post.metadata.attributes[0].value === 'post'

                    post.hasCollectedByMe ? (
                      <div className=" flex items-end rounded-md bg-amber-100 px-2 py-1 text-xs ">
                        COLLECTED
                      </div>
                    ) : (
                      <div className=" flex items-end rounded-md bg-lensGreen px-2 py-1 text-xs ">
                        +COLLECT
                      </div>
                    )
                  ) : (
                    ''
                  )} */}

                  {lensProfile && post.hasCollectedByMe && (
                    // && post.metadata.attributes[0].value === 'post'
                    <div
                      title="You do own this item!"
                      className="flex cursor-default items-end rounded-md bg-amber-100 px-2 py-1 text-xs "
                    >
                      COLLECTED
                    </div>
                  )}

                  {/* {lensProfile && !post.hasCollectedByMe && !isPosting ? (
                    <button
                      onClick={() => {
                        refreshLists(lensProfile?.id);
                        return setFavMenuVisible(!isListVisible);
                      }}
                      className="flex text-right"
                    >
                      <div className=" flex items-center rounded-md bg-lensGreen px-2 py-1 text-xs ">
                        +COLLECT
                      </div>
                    </button>
                  ) : (
                    isPosting && (
                      <div className="flex text-right">
                        <div className=" flex items-center rounded-md bg-lensGreen px-2 py-1 text-xs ">
                          Collecting
                          <div className="relative ml-1 flex items-center">
                            <div
                              title={dotTitle}
                              className={`absolute inset-0 m-auto h-1 w-1 animate-ping
                                rounded-full border ${dotColor}`}
                            />
                            <Spinner h="3" w="3" />
                          </div>
                        </div>
                      </div>
                    )
                  )} */}
                </button>
              </footer>
            </div>
          </div>
          {/* contents */}
          <div className=" mx-auto mb-8  w-11/12 md:w-4/5">
            <div className="mb-4 w-full">
              <div className=" mb-2 flex justify-between ">
                <p
                  title={post.metadata.name || 'untitled'}
                  className="text-light text-xl"
                >
                  {post.metadata.name || 'untitled'}
                </p>

                <div className="flex content-baseline  ">
                  <p className="mt-2 text-xs font-light text-gray-400">
                    {moment(post.createdAt).format('MMM Do YY')}
                  </p>

                  {/* menu */}
                  <div className="dropdown relative inline-block">
                    <div className=" ml-4 items-center   rounded pt-1 font-semibold  text-gray-700">
                      <span className="">
                        <ImageProxied
                          category="profile"
                          src="/assets/icons/dots-vertical.svg"
                          alt=""
                          width={20}
                          height={20}
                        />
                      </span>
                    </div>
                    <ul className="dropdown-menu absolute right-1 z-10 hidden rounded-lg  border-2 border-lensBlack text-lensBlack ">
                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-t-lg bg-lensGray px-6 py-2 hover:bg-lensGray3 hover:text-lensGray2"
                          href="#"
                        >
                          Share
                        </a>
                      </li>
                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-b-lg bg-lensGray px-6 py-2 hover:bg-lensGray3 hover:text-lensGray2"
                          href="#"
                        >
                          Report
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className=" text-sm font-thin text-gray-500">
                {post.metadata.description || ' '}
              </p>

              <div
                className="my-8 "
                dangerouslySetInnerHTML={createMarkup(
                  post.metadata.content || 'no-contents'
                )}
              ></div>
            </div>

            {/* tag list  */}
            <ul className=" flex flex-wrap justify-start text-xs">
              {post.metadata.tags.map((tag: string) => {
                const tagValue = `${post.id}${tag}`;
                return (
                  <li
                    key={tagValue}
                    className=" mr-1 rounded-md bg-lensGray px-2 shadow-sm shadow-lensGray2"
                  >
                    {tag.replace('-', ' ').toUpperCase()}
                  </li>
                );
              })}

              {(!post.metadata.tags || post.metadata.tags.length === 0) && (
                <li
                  key={`${post.id}untagged`}
                  className=" rounded-md bg-lensGray px-2 italic shadow-sm shadow-lensGray2"
                >
                  {' '}
                  {/* untagged */}
                </li>
              )}
            </ul>

            {/* source  */}
            <div className="ext-ellipsis my-4 text-xs text-gray-400">
              {post.metadata.attributes[1]?.value && (
                <>
                  Source:
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-ellipsis"
                    href={post.metadata.attributes[1]?.value}
                  >
                    {' '}
                    {post.metadata.attributes[1]?.value}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* comments section  */}
          <div className="mx-auto w-11/12 md:w-4/5">
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
                          title={`Loading from ${c.profile.picture?.original?.url}`}
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
      </Layout>
    )
  );
}
