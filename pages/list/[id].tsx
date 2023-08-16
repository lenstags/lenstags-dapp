import { useEffect, useState } from 'react';

import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components/Layout';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { useRouter } from 'next/router';

export default function ListDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  const [arrPosts, setArrPosts] = useState<any>([]);
  const [tagsList, setTagsList] = useState<any>([]);

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

  return (
    post && (
      <Layout title="Nata Social | View list" pageDescription="View list">
        <div
          className="   h-64 w-full  px-6 py-6 pt-64 text-black"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent, white), url('/img/backPost.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* header */}
          <header className="relative -top-20 items-center pt-8">
            <div className="row flex justify-between px-14 ">
              <div>
                <p className="text-2xl font-extrabold">
                  {post.metadata.name || 'Untitled post'}
                </p>
                <p className="my-2 font-sans">
                  Last update: {moment(post.createdAt).format("MMM Do 'YY")}
                </p>

                <p className="mt-2 text-xs italic">
                  {post.metadata.description || 'This list has no description'}
                </p>
              </div>

              {/* list menu */}
              <div className="cursor-pointer ">
                <div className="dropdown relative inline-block">
                  <div className="items-center rounded py-2 pr-4 pt-4  font-semibold  text-gray-700">
                    <ImageProxied
                      category="profile"
                      src="/assets/icons/dots-vertical.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
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
            </div>
          </header>

          {/* body */}
          <div className="relative -top-20 flex">
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
      </Layout>
    )
  );
}
