import {
  APP_NAME,
  ATTRIBUTES_LIST_KEY,
  PUBLICATION_METADATA_VERSION
} from '@lib/config';
import {
  Metadata,
  MetadataAttribute,
  PublicationMainFocus,
  IbuiltPost
} from '@lib/lens/interfaces/publication';
import React, { FC, useContext, useEffect, useState } from 'react';

import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { ProfileContext } from './LensAuthenticationProvider';
import { commentGasless } from '@lib/lens/comment-gasless';
import { createPostGasless } from '@lib/lens/post-gasless';
import { getPostComments } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import { createUserList, loadLists, typeList } from '@lib/lens/load-lists';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';
// import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { v4 as uuidv4 } from 'uuid';
import RenderResult from 'next/dist/server/render-result';
import { createPostManager } from '@lib/lens/post';
import { freeCollect } from '@lib/lens/collect';

const TEMPLIST_DELETEEEEE = [
  '⌗ sports',
  'reads',
  'others',
  'arts1',
  'fashion2',
  'pets3',
  'sports2',
  'sports14',
  'sports24',
  'sports34',
  'arts54',
  'arts64',
  'arts74',
  '84',
  '95'
];
interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  const lensProfile = useContext(ProfileContext);
  const [isFavMenuVisible, setFavMenuVisible] = useState(false);
  const [valueListName, setValueListName] = useState('');
  const [isListVisible, setIsListVisible] = useState(false);
  // const [ isListVisible, setIsListVisible] = useState(false)
  const [isListExistent, setIsListExistent] = useState(false);

  const lists = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );
  // console.log('lists: ', lists, lensProfile?.attributes);
  // console.log('-----lists: ', lists);

  // const [selectedList, setSelectedList] =  useState<string[]>(TEMPLIST_DELETEEEEE);

  const [selectedList, setSelectedList] = useState<typeList[]>(lists);

  // console.log('-----selectedList: ', selectedList);

  useEffect(() => {
    const handleDebounce = setTimeout(() => {
      // search debounced value inside the list, and filter the list
      /*
        once debounces should filter the list with the debounced word
        cuando debouncea, deberia filtrar los 
      */

      const bounceResult = lists
        .map((l: typeList) => l.name.toLowerCase())
        .includes(valueListName.toLowerCase());

      console.log(
        'searched item: ',
        valueListName.toLowerCase(),
        ': ',
        bounceResult
      );
      setIsListExistent(bounceResult);
      const filteredList = lists.filter((l: typeList) =>
        l.name.toLowerCase().includes(valueListName.toLowerCase())
      );

      setSelectedList(filteredList);

      console.log('filteredList: ', filteredList);
    }, 100); // Adjust this timeout value to your desired delay

    // This cleanup function will clear the timeout if the component is unmounted before it can execute
    return () => {
      clearTimeout(handleDebounce);
    };
  }, [valueListName]);

  function handleChangeListName(event: React.ChangeEvent<HTMLInputElement>) {
    setValueListName(event.target.value);
  }

  const postFav = async (
    profileId: string,
    listId: string,
    postToBeFavedId: string
  ) => {
    const builtId = `${postToBeFavedId.replace('0x', '')}`;

    const commentMetadata: Metadata = {
      version: PUBLICATION_METADATA_VERSION,
      mainContentFocus: PublicationMainFocus.TEXT_ONLY,
      metadata_id: uuidv4(),
      name: 'commentNAME..reemplacemePorAlgoMejor',
      // description: values.description,
      // content: values.content,
      locale: 'en-US',
      // external_url: values.external_url,
      // image: values.image,
      // imageMimeType: values.imageMimeType,
      attributes: [],
      tags: [builtId], // we will add here the post IDs
      appId: APP_NAME
    };

    // TODO: get comments before!
    const comments = await getPublication(listId);
    console.log('LIST ID: ', listId);
    console.log('PUBLICATION1 w comments?: ', comments);

    await commentGasless(profileId, listId, commentMetadata);
    const PUBLICATION2 = await getPublication(listId);
    console.log('PUBLICATION2 with new comments: ', PUBLICATION2);

    const p = await getPostComments(profileId, listId);
    console.log('PUBLICATION3 with new comments: ', p);
  };

  const handleFav = async (postToBeFavedId: string) => {
    // const p = await getPostComments('0x4b87', '0x4b87-0x63');
    // console.log('PUBLICATION3 with new comments: ', p);
    // return true;

    if (!lensProfile) {
      console.log('no user authenticated? lensProfile', lensProfile);
      throw 'here it isnt lensprofile';
    }

    // apenas entra verificar si tiene lista, y sino crearla
    // move elsewhere
    const lists = await loadLists(lensProfile); // verify existence of default list

    console.log(' lista cargada: ', lists);

    // needs before the selected list!!!

    // FIXME NOT CALLED YET!

    // postFav(lensProfile.id, defaultListId, postToBeFavedId);

    // - if profile doesnt have a deflist on its profile.metadata >>>>  !profile.metadata.listArray.find(r=>r.name==='default')
    // - create the post list, post.attributes = attributes [ { postSubType = 'favsList' }, ... ]
    // - get the postId, and add it to the profile.metadata
  };

  const handleAddPostToList = async (
    selectedPostId: string,
    listId?: string,
    name?: string
  ) => {
    // verify if selected list does exist in the current profile, if not, create it
    // if (!listId) {
    //   // FIXME: DON'T RETURN AND OBJECT?
    //   // TODO: OPTIMIZE IT
    //   listId = (await createUserList(lensProfile, name!)).key;
    //   console.log('List (post) ID returned to the UI: ', listId);
    // }

    //
    /// collect transforms into nft
    // should we mirror->collect

    /*

mirrors only re post existing content, they do not have a ContentURI field 
  and cannot be collected 
  
  

    */

    // collect the post and get the new ID?
    // just add the post to the list

    // reload post data
    const post = await getPublication(selectedPostId);
    if (!post) {
      throw 'Unknown error when retrieving post data';
    }
    console.log('post to be collected: ', post);
    if (!post.hasCollectedByMe) {
      const rrr = await freeCollect(post.id);
      console.log('collected result: ', rrr);
    } else {
      console.log('Post has been collected already!: ', post.hasCollectedByMe);
    }
    // affter collect set the postid in the list

    // const resAdd = await addPostIdtoListId(selectedPostId, listId);

    /* You must use `broadcast` endpoint to collect this publication 
      and must follow  them as it can't be done on your behalf due to having to follow the profile

      debe seguirlos ya que no se puede hacer en su nombre debido a que tiene que seguir el perfil

      */

    // ya tengo el id de la lista, debo crear el post propiamente dicho y añadirlo como comment

    // YA TENGO EL ID DEL POST Y EL ID DE LA LISTA,

    // const r = createPostManager(lensProfile);

    // COLLECT THE DAMN POST and see if the collected id is replicated

    // await addPostIdtoListId(selectedPostId, listId);
  };

  return (
    <div
      style={{ height: '520px' }}
      className="my-1 w-full px-1 md:w-1/2 lg:my-4 lg:w-1/3 lg:px-4  "
    >
      {/* animate-in slide-in-from-bottom duration-1000 */}

      <article className=" Lens_CardsDiv h-full">
        {/* favllect content goes here */}
        {isFavMenuVisible && (
          <div className=" Lens_Cards h-full rounded-lg bg-white px-0">
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
              <p className="font-bold text-lensBlack"></p>
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
                >
                  {list.name}
                </button>
              ))}
            </div>

            <footer className="text-center">
              <button
                onClick={() =>
                  handleAddPostToList(post.id, undefined, valueListName)
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

            <div className=" mb-4 flex justify-between">
              <button
                className="bg-lensinfo p-3 text-black"
                onClick={() => handleFav('')}
              >
                create default list (use ONCE!)
              </button>
            </div>

            {/* handleFav(post.id) */}
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

        {!isFavMenuVisible && (
          <div className="Lens_Cards rounded-lg bg-white">
            <h1 className="w-full items-center p-2 md:p-4">
              <div className="row flex w-full justify-between text-sm font-light text-black">
                {/* profile */}
                <h1 className="text-black">{post.id}</h1>
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
                    <div className="col-span-3 mr-2 flex justify-between">
                      <ImageProxied
                        category="profile"
                        title={`Loading from ${post.profile.picture?.original?.url}`}
                        alt="Profile"
                        height={50}
                        width={50}
                        objectFit="cover"
                        className="h-12 w-12 cursor-pointer rounded-full"
                        src={post.profile.picture?.original?.url}
                      />

                      <div className="col-span-1 cursor-pointer pl-2">
                        <p className=" ">
                          {post.profile.name || post.profile.id}
                        </p>
                        <p className="text-gray-400">@{post.profile.handle}</p>
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

            <Link href={`/posts/${post.id}`}>
              <a
                target="_blank"
                onClick={() => {
                  console.log('POST ', post);
                  window.localStorage.setItem(
                    'LENS_POST',
                    JSON.stringify(post)
                  );
                }}
              >
                <figure className="cap-right">
                  <ImageProxied
                    category="post"
                    height={400}
                    width={600}
                    objectFit="cover"
                    className="block h-auto w-full"
                    src={post.metadata.media[0]?.original.url}
                  />

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
                </div>
              </a>
            </Link>

            {/* date and collected */}
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
                  className="rounded-lg border-2  bg-amber-300 px-2 py-0.5  
text-xs font-light"
                >
                  collected!
                </span>
              ) : (
                <span
                  className="rounded-lg border-2  bg-red-400 px-2 py-0.5  
text-xs font-light"
                >
                  uncollected!
                </span>
              )}

              <button className="text-white" onClick={() => handleFav('')}>
                ver defaultlist
              </button>
            </div>

            <footer className="flex items-center justify-between  py-2 text-right text-black">
              <div className="flex h-full items-center justify-center  border-black ">
                <button
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
                      <div>Challenge ⚖️</div>
                    </div>
                  ) : (
                    ''
                  )}
                </button>

                <button
                  onClick={() => setFavMenuVisible(!isListVisible)}
                  className="flex align-middle"
                >
                  {lensProfile ? (
                    <div className="button_cards flex ">
                      <ImageProxied
                        category="profile"
                        src="/assets/icons/collect.svg"
                        alt="Collect"
                        width={20}
                        height={20}
                      />
                      <div>favsettings</div>
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
                    {/* handleFav(post.id) */}
                    {/* <select
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
                    </select> */}

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
        )}
      </article>
    </div>
  );
};

export default ExploreCard;
