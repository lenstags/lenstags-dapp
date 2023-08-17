import { useEffect, useState } from 'react';

import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components/Layout';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import ModalLists from 'components/ModalLists';
import { useRouter } from 'next/router';
import { LayoutReading } from '@components/index';
import { DotFilledIcon, DotIcon } from '@radix-ui/react-icons';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { PostProcessStatus } from 'utils/helpers';
import { DotWave } from '@uiball/loaders';
import { Spinner } from '@components/Spinner';
import PostIndicators from '@components/PostIndicators';

export default function ListDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  const [arrPosts, setArrPosts] = useState<any>([]);
  const [tagsList, setTagsList] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const [collectStatus, setCollectStatus] = useState(PostProcessStatus.IDLE);
  const [isPosting, setIsPosting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // const storedObject = localStorage.getItem('LENS_POST') || '';
      // const myObject = JSON.parse(storedObject);
      // console.log(myObject);

      // get post object
      if (!id) {
        return;
      }
      const oo = await getPublication(id as string);
      // TODO RECURSIVE LISTS ISSUE
      console.log(oo);
      const arrIds: any = await getLastComment(id as string);
      console.log('XX< ', arrIds.metadata.tags);

      if (!arrIds || arrIds.length === 0) {
        return;
      }
      setPost(oo);

      const arr = await Promise.all(
        arrIds.metadata.tags.map((id: string) => getPublication(id))
      );
      setArrPosts(arr);

      const arrTags = Array.from(
        new Set(arr.map((post) => post.metadata.tags).flat())
      );
      setTagsList(arrTags);
      console.log('oo post: ', oo);
      console.log('posts ', arr);
    };

    fetchData().catch(console.error);
  }, [id]);

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
  };

  const handleOpenModal = (postId: string) => {
    setPostId(postId);
    setIsModalOpen(true);
  };

  return (
    post && (
      <LayoutReading
        title="Nata Social | View list"
        pageDescription="View list"
        breadcumpTitle="List"
      >
        <div
          className="mx-auto h-full w-9/12 text-black"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent, white), url('/img/backPost.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* header */}
          <header className="items-center">
            <div className="flex w-full justify-between">
              <div className="flex w-full items-center gap-6">
                <ImageProxied
                  category="post"
                  height={104}
                  width={160}
                  alt=""
                  className="block h-auto rounded-md object-cover "
                  src="/img/list.png"
                />
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-4xl font-extrabold">
                      {post.metadata.name || 'Untitled post'}
                    </span>
                    <div className="dropdown relative inline-block cursor-pointer">
                      <div className="items-center rounded font-semibold text-gray-700">
                        <EllipsisHorizontalIcon className="h-8 w-8" />
                      </div>
                      <div className="dropdown-menu absolute right-1 z-10 hidden rounded-lg  border-2 border-lensBlack text-lensBlack ">
                        <a
                          className="whitespace-no-wrap block rounded-t-lg bg-lensGray px-6 py-2 hover:bg-lensGray3 hover:text-lensGray2"
                          href="#"
                        >
                          Share
                        </a>
                        <a
                          className="whitespace-no-wrap block rounded-b-lg bg-lensGray px-6 py-2 hover:bg-lensGray3 hover:text-lensGray2"
                          href="#"
                        >
                          Report
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModalLists
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      postId={postId}
                      post={post}
                      processStatus={handleProcessStatus}
                      ownedBy={post.profile.ownedBy}
                      isList={true}
                    />
                    <ImageProxied
                      category="profile"
                      className="h-7 w-7 rounded-full object-cover"
                      src={post.profile.picture.original.url}
                      alt="avatar"
                      width={40}
                      height={40}
                    />
                    <span className="font-bold">{post.profile.name}</span>
                    <span>@{post.profile.handle}</span>
                    <DotFilledIcon />
                    <span>{moment(post.createdAt).format('DD MMM YYYY')}</span>
                    <div className="ml-auto flex">
                      <PostIndicators
                        collects={post.stats.totalAmountOfCollects}
                        comments={post.stats.totalAmountOfComments || 0}
                      />
                      {(isFinished || post.hasCollectedByMe) && (
                        // && post.metadata.attributes[0].value === 'post'
                        <div
                          title="You do own this item!"
                          className="flex cursor-default items-end rounded-md bg-teal-300 px-2 py-1 text-right text-xs font-bold "
                        >
                          Collected
                        </div>
                      )}

                      {!isFinished && !isPosting && !post.hasCollectedByMe && (
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
                    </div>
                  </div>
                  <p className="text-xs italic">
                    {post.metadata.description ||
                      'This list has no description'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* body */}
          <div className="flex">
            <div className="w-2/3 px-14 pt-4">
              <p className="mt-4 font-semibold">
                {arrPosts && arrPosts.length > 0
                  ? ``
                  : 'The list has no items yet, have you explored our awesome content?'}
              </p>

              <div className="flex">
                <input
                  type={'text'}
                  placeholder="Search for Tags and keywords..."
                  className=" my-4 w-full rounded-lg border-2 border-solid border-gray-100 bg-gray-50 px-2 py-1"
                />
                <button className="ml-2  bg-transparent text-2xl text-black">
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
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </button>
                <button className=" ml-2 bg-transparent text-2xl text-black">
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
                      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                    />
                  </svg>
                </button>
              </div>

              {arrPosts.map((p: any) => {
                return (
                  <div key={p.id} className="mt-6 flex w-full">
                    <ImageProxied
                      category="post"
                      height={104}
                      width={104}
                      alt=""
                      className="block h-auto rounded-md object-cover "
                      src={p.metadata.media[0]?.original.url}
                    />

                    <div className="w-full">
                      <div className="ml-4">
                        <a
                          href={`/post/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex items-baseline">
                            <p className="w-9/12 text-xl ">{p.metadata.name}</p>
                            <span className="w-2/12 text-right text-xs">
                              By {p.profile.name}
                            </span>
                            <span className="items-left w-1/12 text-right text-xs text-gray-400">
                              {moment(p.createdAt).format('MMM D')}
                            </span>
                          </div>
                        </a>
                        <p className="mt-1 text-sm">
                          {p.metadata.description || 'No description'}
                        </p>

                        <div>
                          <div className="flex w-full  text-black">
                            <span className="flex items-center text-xs ">
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

                              {p.stats?.totalAmountOfComments || '0'}
                            </span>

                            <div className="flex w-10/12">
                              <span className="mx-4 flex items-center text-xs ">
                                <ImageProxied
                                  category="profile"
                                  src="/assets/icons/collect.svg"
                                  alt="Collect"
                                  width={20}
                                  height={20}
                                  style={{
                                    filter: 'brightness(20%) contrast(0%)'
                                  }}
                                />
                                {p.stats?.totalAmountOfCollects || '0'}
                              </span>

                              <span className="items-left text-left text-xs ">
                                <ul className=" flex flex-wrap gap-1 py-2 text-xs">
                                  {p.metadata.tags.map((tag: string) => (
                                    <li
                                      key={tag}
                                      className=" mx-2 rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold shadow-sm shadow-gray-400"
                                    >
                                      {tag}
                                    </li>
                                  ))}
                                </ul>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* list menu */}
                      {/* <div className="cursor-pointer ">
                      <div className="dropdown relative inline-block">
                        <div className="items-center rounded py-2 pt-4 pr-4  font-semibold  text-gray-700">
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
                    </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="m-4 h-auto w-1/3 rounded-md bg-white p-4">
              {/* <div className="bg-gray-100 px-4 py-2">
                 
                </div> */}

              <div className="mt-4 bg-gray-100 px-4 py-2">
                <p className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-2 h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.metadata.name} tags
                </p>
                <div className="mt-2 text-xs">
                  <span className=" text-xs ">
                    <ul className="flex origin-center flex-wrap place-items-center content-center items-center justify-center gap-1  self-center py-2 text-xs">
                      {tagsList.map((tag: string) => (
                        <li
                          key={tag}
                          className="mx-2 rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold shadow-sm shadow-gray-400"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutReading>
    )
  );
}
