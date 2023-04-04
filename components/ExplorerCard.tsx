import React, { FC, useContext, useEffect, useState } from 'react';
import { createUserList, typeList } from '@lib/lens/load-lists';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import ListImages from './ListImages';
import { ProfileContext } from './LensAuthenticationProvider';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { addPostIdtoListId } from '@lib/lens/post';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import { hidePublication } from '@lib/lens/hide-publication';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  // fetch data for current post, get the latest coments
  const isList = post.metadata.attributes[0].value === 'list';
  const lensProfile = useContext(ProfileContext);
  const [isFavMenuVisible, setFavMenuVisible] = useState(false);
  const [valueListName, setValueListName] = useState('');
  const [isListVisible, setIsListVisible] = useState(false);
  const [isListExistent, setIsListExistent] = useState(false);

  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);

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

  const handleRemove = async (postId: string) => {
    return await hidePublication(postId);
  };

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
    // verify if selected list does exist in the current profile, if not, create it
    if (!listId) {
      // FIXME: DON'T RETURN AND OBJECT?
      // TODO: OPTIMIZE IT
      listId = (await createUserList(lensProfile, name!)).key;
      console.log('List (post) ID returned to the UI: ', listId);
    }

    // TODO:
    // const clonedId = await cloneAndCollectPost(lensProfile, selectedPostId);
    // if (!clonedId) {
    //   throw 'Unknown error when cloning';
    // }

    // just add the post to the list

    const addResult = await addPostIdtoListId(
      profileId,
      listId!,
      selectedPostId
    );

    console.log('finished, ', addResult);
    // TODO: SHOW SOME UI BOX
    // TODO: update lists in UI!

    setFavMenuVisible(false);
    return;
  };

  return (
    <div
      // style={{ height: '360px' }}
      key={post.id}
      className="my-1 w-full px-1 md:w-1/2 lg:my-4 lg:w-1/4 lg:px-4  "
    >
      {/* animate-in slide-in-from-bottom duration-1000 */}

      <article className="h-full">
        {/* favllect content goes here */}
        {isFavMenuVisible && (
          <div className=" lens-post mt-3 h-full rounded-lg bg-white px-0">
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
                placeholder="Filter lists..."
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

            {/* <div className="mt-4  p-2 text-left">

              <select
                className=" bg-lensGreen"
                value={selectedList}
                onChange={handleChange}
              >
                <option value="">Pick a list</option>
                {lists.map((list: any) => (
                  <option key={list.key} value={list.key}>
                    {list.name}
                  </option>
                ))}
              </select>

              <button className="bg-white px-3 py-1 text-black">Set</button>
              <button className="bg-white px-3 py-1 text-black">
                + New list
              </button>
            </div> */}

            {/* <button
              onClick={() => setIsListVisible(!isListVisible)}
              className="flex align-middle"
            >
              {lensProfile ? (
                <div className="button_cards flex">
                  <ImageProxied
                    category="profile"
                    src="/assets/icons/collect.svg"
                    alt="Collect"
                    width={20}
                    height={20}
                  />
                  <div>Favllect</div>
                </div>
              ) : (
                ''
              )}
            </button> */}
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
              className={`px-2 py-1
              ${isList ? 'lens-folder' : 'lens-post'}`}
            >
              {/* card contents */}
              <h1 className="w-full items-center py-2">
                <div className="flex w-full justify-between text-sm font-light text-black">
                  {/* profile */}
                  <Link href={`/profile/${post.profile.id}`}>
                    <a
                      target="_blank"
                      onClick={() => {
                        window.localStorage.setItem(
                          'LENS_PROFILE',
                          JSON.stringify(post.profile)
                        );
                      }}
                    >
                      <div className="col-span-3  flex justify-between">
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
                    </a>
                  </Link>

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

                    <ul
                      className="dropdown-menu absolute  right-1 top-6 z-10 hidden rounded-lg border-2 border-gray-200 
                      bg-gray-50 text-lensBlack shadow-lg "
                    >
                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-t-lg bg-gray-50 px-4 py-2 hover:bg-lensGreen hover:text-black"
                          href="#"
                        >
                          Share
                        </a>
                      </li>

                      <li className="">
                        {lensProfile && post.profile.id === lensProfile.id && (
                          <span
                            className="whitespace-no-wrap flex bg-gray-50  px-4 py-2 hover:bg-lensGreen hover:text-black"
                            onClick={() => handleRemove(post.id)}
                          >
                            Remove
                          </span>
                        )}
                      </li>

                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-b-lg bg-gray-50 px-4 py-2 hover:bg-lensGreen hover:text-black"
                          href="#"
                        >
                          Report
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </h1>

              <Link href={isList ? `/list/${post.id}` : `/post/${post.id}`}>
                <a
                  target="_blank"
                  onClick={() => {
                    // TODO: fix this
                    console.log('POST ', post);
                    window.localStorage.setItem(
                      'LENS_POST',
                      JSON.stringify(post)
                    );
                  }}
                >
                  {/* old inset tags */}
                  {/* <figure className="cap-right">
                    {isList ? (
                      <ListImages postId={post.id} />
                    ) : (
                      <ImageProxied
                        category="post"
                        height={220}
                        width={600}
                        objectFit="cover"
                        className="block h-auto w-full"
                        src={post.metadata.media[0]?.original.url}
                      />
                    )}

                    <figcaption className="p-1">
                      <ul className=" flex flex-wrap gap-1 py-2 text-xs">
                        {post.metadata.tags.map((tag: string) => {
                          return (
                            <li
                              key={`${post.id}${tag}`}
                              className=" rounded-md bg-lensGray px-2 shadow-sm shadow-lensGray2"
                            >
                              {tag.toUpperCase()}
                            </li>
                          );
                        })}
                      </ul>
                    </figcaption>
                  </figure> */}

                  {isList ? (
                    <ListImages postId={post.id} />
                  ) : (
                    <ImageProxied
                      category="post"
                      height={'400px'}
                      width={'600px'}
                      // width={'100%'}
                      // height={'100%'}
                      objectFit="cover"
                      className="blo ck w-full rounded-md"
                      src={post.metadata.media[0]?.original.url}
                    />
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
                        untagged
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
                    <p className="text-xs font-thin text-gray-500">
                      {post.metadata.description || 'no-abstract'}
                    </p>
                  </div>
                </a>
              </Link>

              {/* date and collected indicators*/}

              <footer className="flex items-center justify-between py-2 text-black">
                <p className="mt-1 text-xs font-light text-gray-400">
                  {moment(post.createdAt).format('MMM Do YY')}
                </p>
                <div className="flex items-end text-xs font-light">
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

                <button
                  onClick={() => {
                    refreshLists(lensProfile?.id);
                    return setFavMenuVisible(!isListVisible);
                  }}
                  className="flex text-right"
                >
                  {lensProfile ? (
                    // && post.metadata.attributes[0].value === 'post'

                    post.hasCollectedByMe ? (
                      <div className=" flex items-end rounded-md bg-amber-100 px-2 py-1 text-xs ">
                        Collected
                      </div>
                    ) : (
                      <div className=" flex items-end rounded-md bg-lensGreen px-2 py-1 text-xs ">
                        +COLLECT
                      </div>
                    )
                  ) : (
                    ''
                  )}
                </button>

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
    </div>
  );
};

export default ExploreCard;
