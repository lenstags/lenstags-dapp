import { useEffect, useState } from 'react';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { Spinner } from 'components/Spinner';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { queryProfile } from '@lib/lens/dispatcher';
import { typeList } from '@lib/lens/load-lists';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import { useSnackbar } from 'material-ui-snackbar-provider';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  const [lensProfile, setProfile] = useState<any>();
  const [isPosting, setIsPosting] = useState(false);
  const [dotColor, setDotColor] = useState('');
  const [dotTitle, setDotTitle] = useState('');
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

  useEffect(() => {
    const fetchData = async () => {
      const postObject = await getPublication(id as string);
      const profileResult = await queryProfile({
        profileId: postObject?.profile.id
      });
      if (!profileResult) {
        return;
      }
      setProfile(profileResult);
      setPost(postObject);
      console.log('ooo ', postObject);
    };

    fetchData().catch(console.error);
  }, [id]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  return (
    post && (
      <Layout
        title="Lenstags | Explore"
        pageDescription="Profile"
        screen={true}
      >
        <div className="w-full">
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
              className="md:w-4/5 mx-auto  w-11/12   pt-60"
            >
              <div className="  flex items-center ">
                <div
                  className="relative   items-center  rounded-full bg-white pt-1 text-center"
                  style={{ height: 66, width: 66 }}
                >
                  <ImageProxied
                    className="absolute rounded-full"
                    category="profile"
                    height={60}
                    width={60}
                    objectFit="cover"
                    src={pictureUrl}
                    alt="avatar"
                  />
                </div>
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

          <div className="md:w-4/5  mx-auto  w-11/12 py-6">
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
          <div className=" md:w-4/5 mx-auto  mb-14 w-11/12">
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
                className="m-8 "
                dangerouslySetInnerHTML={createMarkup(
                  post.metadata.content || 'no-contents'
                )}
              ></div>
            </div>

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
                  untagged
                </li>
              )}
            </ul>
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
        </div>
      </Layout>
    )
  );
}
