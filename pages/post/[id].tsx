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
import { ProfileQuery } from '@lib/lens/graphql/generated';
import TagStrip from 'components/TagStrip';
import { commentGasless } from '@lib/lens/comment-gasless';
import { getComments } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import { hidePublication } from '@lib/lens/hide-publication';
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
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [comment, setComment] = useState<string>();
  const [allComments, setAllComments] = useState<any>();
  const [coverURL, setCoverURL] = useState<any>();
  const [domainURL, setDomainURL] = useState<any>();

  // Code to be used for collecting later
  const snackbar = useSnackbar();
  const [isListVisible, setIsListVisible] = useState(false);
  const [isFavMenuVisible, setFavMenuVisible] = useState(false);

  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute: any) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);
  const { disconnect } = useDisconnect();

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
  ////

  function createMarkup(innerHtml: string) {
    return { __html: innerHtml };
  }

  const refreshComments = async () => {
    const comments = await getComments(ii);
    setAllComments(comments);
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
        <div className="w-full px-6 pb-4">
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

              {/* collect zone */}
              <div className="flex items-center">collect</div>
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
