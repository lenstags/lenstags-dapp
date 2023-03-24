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
      style={{ height: '400px' }}
      className="my-1 w-full px-1 md:w-1/2 lg:my-4 lg:w-1/4 lg:px-4  "
    >
      {/* animate-in slide-in-from-bottom duration-1000 */}

      <article className="h-full">
        {/* favllect content goes here */}
        {isFavMenuVisible && (
          <div className=" h-full rounded-lg bg-white px-0">
            <div className="flex px-4">
              <button
                id="btnBack"
                onClick={() => setFavMenuVisible(false)}
                className="bg-white text-2xl "
              >
                ←
              </button>
              <h1 className="w-full items-center truncate text-ellipsis pt-1 text-center ">
                {post.metadata.name || 'untitled'}
              </h1>
            </div>

            {/* post titles */}
            <div className="mb-3 px-4 text-center">
              <p className="font-bold text-black"></p>
            </div>

            <div className="mx-4 mb-2">
              <input
                type="text"
                autoComplete="off"
                value={valueListName}
                onChange={handleChangeListName}
                className=" w-full rounded-lg border-2 border-solid border-gray-200 px-4 py-3 text-lg leading-none text-gray-600 outline-none"
                name="tag-search-input"
                id="tag-search-input"
                // onKeyDown={handleKeyDown}
                placeholder="Filter lists..."
              />
            </div>

            <div className="mb-4 h-4/6 overflow-visible overflow-y-scroll  border-b-2 border-solid border-gray-100 px-4">
              {selectedList.map((list: typeList) => (
                <button
                  className=" my-1 w-full rounded-lg border-2 border-solid border-amber-100 bg-amber-50 py-3  text-lg text-black hover:bg-amber-100"
                  key={list.key}
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
                  {`${list.key}--${list.name}`}
                </button>
              ))}
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
              className={`px-4 py-2 
              ${isList ? 'lens-folder' : 'lens-post'}`}
            >
              {/* card contents */}
              <h1 className="w-full items-center  md:p-2">
                <div className="row flex w-full justify-between text-sm font-light text-black">
                  {/* profile */}

                  <Link href={`/profiles/${post.profile.id}`}>
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
                          <p className="font-light text-gray-300">
                            @{post.profile.handle}
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>

                  {/* profile menu */}
                  <div className="dropdown relative inline-block cursor-pointer">
                    <div className=" items-center rounded py-2 font-semibold text-gray-700">
                      <ImageProxied
                        category="profile"
                        src="/assets/icons/dots-vertical.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </div>
                    <ul className="dropdown-menu absolute right-1 z-10 hidden rounded-lg  border-2 border-lensBlack text-lensBlack ">
                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-t-lg bg-lensGray py-2 px-6 hover:bg-lensGray3 hover:text-lensGray2"
                          href="#"
                        >
                          Share
                        </a>
                      </li>
                      <li className="">
                        <a
                          className="whitespace-no-wrap block rounded-b-lg bg-lensGray py-2 px-6 hover:bg-lensGray3 hover:text-lensGray2"
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
                  <figure className="cap-right">
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
                        {post.metadata.tags.map((tag: string) => (
                          <li
                            key={tag}
                            className="rounded-lg border-2 border-lensBlack bg-lensGreen px-2 font-semibold "
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </figcaption>
                  </figure>

                  <div className="mb-3">
                    <p className="font-bold text-lensBlack">
                      {post.metadata.name || 'untitled'}
                    </p>
                    <p className="text-sm font-thin text-gray-500">
                      {post.metadata.description || 'no-abstract'}
                    </p>
                    <small className=" text-xs text-gray-400">{post.id}</small>
                  </div>
                </a>
              </Link>

              {/* date and collected indicators*/}
              <div className="mb-2 flex justify-between">
                <span
                  className="mr-2 rounded-lg border-2 border-lensBlack bg-lensGray3 px-2 
          py-0.5 text-xs font-light"
                >
                  12 Collected
                </span>
                <span
                  className="rounded-lg border-2 border-lensBlack bg-lensGray px-2 py-0.5  
           text-xs font-light"
                >
                  {moment(post.createdAt).format('MMM Do YY')}
                </span>

                {post.hasCollectedByMe ? (
                  <span
                    className="rounded-lg border-2  border-solid border-amber-400 bg-amber-300 px-2 py-0.5  
text-xs font-light"
                  >
                    Collected
                  </span>
                ) : (
                  <span
                    className="rounded-lg border-2  bg-red-400 px-2 py-0.5  
text-xs font-light"
                  >
                    uncollected!
                  </span>
                )}
              </div>

              <footer className="flex items-center justify-between  py-2 text-right text-black">
                <div className="flex h-full items-center justify-center  border-black ">
                  <button
                    onClick={() => {
                      refreshLists(lensProfile?.id);
                      return setFavMenuVisible(!isListVisible);
                    }}
                    className="flex align-middle"
                  >
                    {lensProfile &&
                    post.metadata.attributes[0].value === 'post' ? (
                      <div className=" flex rounded-md bg-lensGreen px-2 py-1 ">
                        <ImageProxied
                          category="profile"
                          src="/assets/icons/collect.svg"
                          alt="Collect"
                          width={20}
                          height={20}
                        />
                        <div> COLLECT</div>
                      </div>
                    ) : (
                      ''
                    )}
                  </button>
                </div>

                <div className="flex items-center text-xs ">
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
                </div>
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
