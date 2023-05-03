import React, { FC, useContext, useEffect, useState } from 'react';
import { addPostIdtoListId, cloneAndCollectPost } from '@lib/lens/post';
import { createUserList, typeList } from '@lib/lens/load-lists';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import ListImages from './ListImages';
import { ProfileContext } from './LensAuthenticationProvider';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { Spinner } from './Spinner';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { freeCollect } from '@lib/lens/collect';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';
import { useDisconnect } from 'wagmi';
import { useSnackbar } from 'material-ui-snackbar-provider';

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  // fetch data for current post, get the latest comments
  const isList = post.metadata.attributes[0].value === 'list';
  // const lensProfile = useContext(ProfileContext);
  const { profile: lensProfile } = useContext(ProfileContext);
  const [openReconnect, setOpenReconnect] = useState(false);
  const [isFavMenuVisible, setFavMenuVisible] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [dotColor, setDotColor] = useState('');
  const [dotTitle, setDotTitle] = useState('');
  const snackbar = useSnackbar();
  const [isDeleted, setIsDeleted] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [pointerEvents, setPointerEvents] = useState<any>('all');
  const [valueListName, setValueListName] = useState('');
  const [isListVisible, setIsListVisible] = useState(false);
  const [isListExistent, setIsListExistent] = useState(false);

  // const profil: ProfileQuery['profile'] = await queryProfile({
  //   profileId: pro.id
  // });

  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );
  // console.log('firstList ', firstList, lensProfile);

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  //handles debounce
  useEffect(() => {
    const handleDebounce = setTimeout(() => {
      const bounceResult = lists
        .map((l: typeList) => l.name.toLowerCase())
        .includes(valueListName.toLowerCase());

      setIsListExistent(bounceResult);
      const filteredList = lists.filter((l: typeList) =>
        l.name.toLowerCase().includes(valueListName.toLowerCase())
      );

      setSelectedList(filteredList);
    }, 300); // Adjust this timeout value to your desired delay

    return () => {
      clearTimeout(handleDebounce); // This cleanup function will clear the timeout if the component is unmounted before it can execute
    };
  }, [valueListName]);

  // handles timeout
  useEffect(() => {
    const fetchData = async () => {
      const latestComment = await getLastComment(post.id);
      // @ts-ignore
      if (latestComment?.metadata?.tags?.length > 0) {
        // @ts-ignore
        // console.log('latestComment,  ', latestComment?.metadata?.tags);
        // @ts-ignore
        latestComment.metadata.tags.map((postId: string) => {
          getPublication(postId).then((post) => {
            // @ts-ignore
            return post?.metadata.media?.original?.url;
          });
        });
      }
    };
    fetchData();
  }, [post]);

  const handleRemove = (postId: string) =>
    hidePublication(postId).then((res) => {
      snackbar.showMessage(
        '🗑️ Post removed successfully'
        // 'Undo', () => handleUndo()
      );
      setOpacity(0.3);
      setPointerEvents('none');
      setIsDeleted(true);
    });

  const handleChangeListName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValueListName(event.target.value);

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

  // - if profile doesnt have a deflist on its profile.metadata >>>>  !profile.metadata.listArray.find(r=>r.name==='default')
  // - create the post list, post.attributes = attributes [ { postSubType = 'favsList' }, ... ]
  // - get the postId, and add it to the profile.metadata

  const handleAddPostToList = async (
    profileId: string,
    selectedPostId: string,
    listId?: string,
    name?: string
  ) => {
    setIsPosting(true);
    setDotColor(' border-red-400 bg-red-600 ');
    setDotTitle('Creating post');
    setFavMenuVisible(false);

    // verifies if selected list does exist in the current profile, if not, create it
    if (!listId) {
      // FIXME: DON'T RETURN AN OBJECT?
      // TODO: OPTIMIZE IT
      setDotColor(' border-red-400 bg-black');
      setDotTitle('Creating list');
      snackbar.showMessage(
        '🟦 Creating the new list, you can continue exploring.'
      );
      listId = (await createUserList(lensProfile, name!)).key;
      console.log('List (post) ID returned to the UI: ', listId);
    }

    // TODO:
    // const clonedId = await cloneAndCollectPost(lensProfile, selectedPostId);
    // if (!clonedId) {
    //   throw 'Unknown error when cloning';
    // }

    snackbar.showMessage(
      '🟦 Collecting and minting item, you can continue exploring.'
    );
    const collectResult = await freeCollect(selectedPostId);
    if (collectResult.errors?.length > 0) {
      setIsPosting(false);
      if (collectResult.errors[0].extensions.code === 'UNAUTHENTICATED') {
        snackbar.showMessage(`🟥 Error: ${collectResult.errors[0].message}`);
        setOpenReconnect(true);
        return;
      }
      setIsPosting(false);
      snackbar.showMessage(`🟨 Attention: ${collectResult.errors[0].message}`);
      return;
    }

    // just add the post to the list
    setDotColor(' border-yellow-400 bg-yellow-600 ');
    setDotTitle('Indexing list');

    const addResult = await addPostIdtoListId(
      profileId,
      listId,
      selectedPostId
    );

    snackbar.showMessage(
      '🟩 Item added to list! 🗂️'
      // 'Undo', () => handleUndo()
    ); // TODO: SHOW SOME UI BOX
    // TODO: update lists in UI!
    setDotColor(' border-blue-400 bg-blue-600 ');
    setDotTitle('Finished');
    setIsPosting(false);

    return;
  };

  return (
    <div
      // TODO: decide which height shall we use style={{ height: '360px' }}
      key={post.id}
      id="CardContainer"
      className=" md:w-1/2 lg:w-1/4 w- full px-1 py-2 animate-in fade-in-50 duration-1000  lg:px-4"
      style={{ opacity, pointerEvents }}
    >
      {/* animate-in slide-in-from-bottom duration-1000 */}
      {openReconnect ? (
        <div className="mt-14 h-full text-center ">
          {/* TODO  write status in a context so the app shows a modal */}
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
          {isFavMenuVisible && (
            <div
              style={{ height: '360px' }}
              className=" lens-post mt-3 h-full rounded-lg bg-white px-0"
            >
              <div className="flex px-2">
                <button
                  id="btnBack"
                  onClick={() => setFavMenuVisible(false)}
                  className="bg-white text-xl "
                >
                  ←
                </button>
                <h1 className=" w-full items-center truncate text-ellipsis pl-1 pt-1 ">
                  {post.metadata.name || 'untitled'}
                </h1>
              </div>

              <div className="m-2">
                <input
                  type="text"
                  autoComplete="off"
                  value={valueListName}
                  onChange={handleChangeListName}
                  className=" w-full rounded-lg border-2 border-solid border-gray-200 px-2 py-1 text-sm leading-none text-gray-600 outline-none"
                  name="tag-search-input"
                  id="tag-search-input"
                  // onKeyDown={handleKeyDown}
                  placeholder="Select a list or type one..."
                />
              </div>

              <div className="scrollbar-hide z-10 mb-4 h-56 overflow-y-auto border-b-2 border-solid border-gray-100 px-1">
                {selectedList.map((list: typeList) => {
                  return (
                    <button
                      className=" my-1 w-full rounded-lg border-solid 
                       py-1  text-sm   hover:bg-amber-100"
                      key={list.key}
                      style={{
                        color: '#745f2b',
                        backgroundColor: '#fffee8',
                        border: '1px solid #fdf4dc'
                      }}
                      value={list.key}
                      onClick={() =>
                        handleAddPostToList(
                          lensProfile?.id,
                          post.id,
                          list.key,
                          undefined
                        )
                      }
                    >
                      {list.name}
                      {/* {list.key} */}
                    </button>
                  );
                })}
              </div>

              <footer className="text-center">
                <button
                  onClick={() =>
                    handleAddPostToList(
                      lensProfile?.id,
                      post.id,
                      undefined,
                      valueListName
                    )
                  }
                  className={`rounded-lg px-2 py-2 ${
                    valueListName && !isListExistent
                      ? 'bg-lensGreen'
                      : 'disabled cursor-not-allowed bg-gray-100'
                  }`}
                  disabled={!valueListName || isListExistent}
                >
                  ✦ CREATE AND ADD
                </button>
              </footer>
            </div>
          )}

          {/* main tab contents goes here */}
          {!isFavMenuVisible && (
            <div>
              <div
                className={` ${
                  isList ? 'lens-folder-tab' : 'lens-folder-tab-empty'
                }`}
              ></div>
              <div
                style={{ position: 'relative', height: '360px' }}
                className={`px-2 py-1
              ${isList ? 'lens-folder' : 'lens-post'}`}
              >
                {/* card contents */}
                <h1 className="w-full items-center py-2">
                  <div className="flex w-full justify-between text-sm font-light text-black">
                    {/* profile */}
                    <a
                      rel="noreferrer"
                      href={`/profile/${post.profile.id}`}
                      target="_blank"
                    >
                      <div
                        onClick={() => {
                          window.localStorage.setItem(
                            'LENS_PROFILE',
                            JSON.stringify(post.profile)
                          );
                        }}
                        className="col-span-3 flex cursor-pointer justify-between"
                      >
                        <ImageProxied
                          category="profile"
                          title={`Loading from ${post.profile.picture?.original?.url}`}
                          alt="Profile"
                          height={40}
                          width={40}
                          objectFit="cover"
                          className="h-12 w-12 cursor-pointer rounded-full"
                          src={post.profile.picture?.original?.url}
                        />

                        <div className="col-span-1 cursor-pointer pl-2">
                          <p className=" ">
                            {post.profile.name || post.profile.id}
                          </p>
                          <p className="font-light text-gray-400">
                            @{post.profile.handle}
                          </p>
                        </div>
                      </div>
                      {/* </a> */}
                    </a>

                    {/* profile menu */}
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
                      bg-gray-50 text-lensBlack shadow-lg  shadow-gray-400 "
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
                          {lensProfile &&
                            post.profile.id === lensProfile.id && (
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
                </h1>

                {/* <Link > */}
                <a
                  rel="noreferrer"
                  target="_blank"
                  href={isList ? `/list/${post.id}` : `/post/${post.id}`}
                  onClick={() => {
                    // TODO: fix this
                    window.localStorage.setItem(
                      'LENS_POST',
                      JSON.stringify(post)
                    );
                  }}
                >
                  {isList ? (
                    <ListImages postId={post.id} />
                  ) : (
                    <div className="relative ">
                      {/* link provided by the user */}
                      {post.metadata.attributes[1]?.value && (
                        <div
                          style={{
                            bottom: '5%'
                          }}
                          className="-top-30 absolute z-10  text-xs 
                            text-white mix-blend-difference hover:text-lensGreen hover:mix-blend-difference"
                          title="Jump straight to the original post 🌐"
                        >
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className=" justify-end"
                            href={post.metadata.attributes[1]?.value}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-6 w-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"
                              />
                            </svg>
                          </a>
                        </div>
                      )}

                      <ImageProxied
                        category="post"
                        height={'400px'}
                        width={'600px'}
                        // width={'100%'}
                        // height={'100%'}
                        objectFit="cover"
                        className=" w-full rounded-md  animate-in fade-in-50 duration-1000"
                        src={post.metadata.media[0]?.original.url}
                      />
                    </div>
                  )}

                  <ul className=" flex flex-wrap justify-end gap-1 pb-2 text-right text-xs">
                    {post.metadata.tags.map((tag: string) => {
                      const tagValue = `${post.id}${tag}`;
                      return (
                        <li
                          key={tagValue}
                          className=" rounded-md bg-lensGray px-2 shadow-sm shadow-lensGray2"
                        >
                          {tag.replace('-', ' ').toUpperCase()}
                        </li>
                      );
                    })}

                    {(!post.metadata.tags ||
                      post.metadata.tags.length === 0) && (
                      // !isList &&
                      <li
                        key={`${post.id}untagged`}
                        className=" rounded-md bg-lensGray px-2 italic shadow-sm shadow-lensGray2"
                      >
                        {/* untagged */}{' '}
                      </li>
                    )}
                  </ul>

                  <div className="mb-1">
                    <p
                      title={post.metadata.name || 'untitled'}
                      className="text-light truncate text-ellipsis"
                    >
                      {post.metadata.name || 'untitled'}
                    </p>
                    <p
                      className="my-1 overflow-auto text-xs font-thin text-gray-500"
                      style={{
                        height: '32px',
                        overflowY: 'scroll'
                      }}
                    >
                      {!isList ? post.metadata.description || ' ' : <br />}
                      <style>{`
                      ::-webkit-scrollbar {
                        width: 5px;
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
                    </p>
                  </div>
                </a>
                {/* </Link> */}

                {/* date and collected indicators*/}
                <footer
                  style={{ position: 'absolute', bottom: 0 }}
                  className="grid grid-cols-3   items-center    py-2 text-xs text-black"
                >
                  <p className="mt-1 font-light text-gray-400">
                    {moment(post.createdAt).format('MMM Do YY')}
                  </p>
                  <div className="flex items-end  font-light">
                    <ImageProxied
                      category="profile"
                      src="/assets/icons/collect.svg"
                      alt="Collect"
                      title="Total amount of collects"
                      width={20}
                      height={20}
                    />
                    {post.stats.totalAmountOfCollects}
                  </div>

                  {lensProfile && post.hasCollectedByMe && (
                    // && post.metadata.attributes[0].value === 'post'
                    <div
                      title="You do own this item!"
                      className="flex   cursor-default items-end rounded-md bg-amber-100 px-1 py-1 text-right text-xs "
                    >
                      COLLECTED
                    </div>
                  )}

                  {lensProfile && !post.hasCollectedByMe && !isPosting ? (
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
                  )}
                  {/* comments */}
                  {/* <div className="flex items-center text-xs ">
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
                </div> */}
                  {isListVisible && (
                    <>
                      <br />
                      <div className="absolute mt-24 w-44 rounded-lg bg-yellow-200 p-2 text-left">
                        <button className="bg-white px-3 py-1 text-black">
                          Set
                        </button>
                        <button className=" bg-white px-3 py-1 text-black">
                          + New list
                        </button>
                      </div>
                    </>
                  )}
                </footer>
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};

export default ExploreCard;
