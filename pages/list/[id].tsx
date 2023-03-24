import { useEffect, useState } from 'react';

import ImageProxied from 'components/ImageProxied';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { useRouter } from 'next/router';

export default function ListDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  const [arrPosts, setArrPosts] = useState<any>([]);

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
      const arrIds: any = await getLastComment(id as string);
      // console.log('XX ', arrIds.metadata.tags);

      if (!arrIds || arrIds.length === 0) {
        return;
      }
      setPost(oo);

      const arr = await Promise.all(
        arrIds.metadata.tags.map((id: string) => getPublication(id))
      );
      setArrPosts(arr);
      console.log('oo post: ', oo);
      console.log('posts ', arr);
    };

    fetchData().catch(console.error);
  }, [id]);

  return (
    post && (
      <article className=" bg-white">
        <div className="border-gray m-4 rounded-lg border-2 border-solid">
          <header className="w-full items-center ">
            <div className="row flex w-full justify-between">
              <p className="p-4 text-xl font-extrabold">
                {post.metadata.name || 'Untitled post'}
              </p>
              {/* list menu */}
              <div className="cursor-pointer ">
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
              </div>
            </div>
            <div className="border-gray flex border-t-2 border-solid p-4 text-gray-400">
              <div className="w-2/4">
                <p className="mb-1">
                  Created date: {moment(post.createdAt).format("MMM Do 'YY")}
                </p>
                <p className="mb-1">
                  Last update: {moment(post.createdAt).format("MMM Do 'YY")}
                </p>
              </div>
              <div className="w-2/4">
                <p className="mb-1">
                  Tags:
                  <span className=" mx-2 rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold shadow-sm shadow-gray-400">
                    UX/UI
                  </span>
                </p>
                <p className="mb-1">12 times collected</p>
                <p className=" mb-1 text-blue-600">List history</p>
              </div>
            </div>
            <div className="border-gray border-t-2 border-solid p-4 text-gray-400">
              {post.metadata.description || 'This list has no description'}
            </div>
          </header>
        </div>
        {/* body */}
        <div className="p-4">
          <div className="flex w-full">
            <input
              type={'text'}
              placeholder="Search in list..."
              className=" my-4 w-full rounded-lg border-2 border-solid border-gray-100 bg-gray-50 px-2 py-1"
            />
            <button className=" ml-2  bg-transparent text-2xl text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </button>
            <button className=" ml-2 bg-transparent text-2xl text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-lg font-semibold">
            {arrPosts && arrPosts.length > 0
              ? `All content of the ${post.metadata.name} list`
              : 'The list has no items yet, have you explored our awesome content?'}
          </p>

          <div className="">
            {arrPosts.map((p: any) => {
              return (
                <div
                  key={p.id}
                  className="border-gray mt-4 rounded-lg border-2 border-solid px-4 pt-4 pb-2"
                >
                  <div className="flex">
                    <ImageProxied
                      category="post"
                      height={50}
                      width={50}
                      objectFit="cover"
                      className="block h-auto w-full"
                      src={p.metadata.media[0]?.original.url}
                    />
                    <div className="ml-4">
                      <p className="text-xl">{p.metadata.name}</p>
                      <p className="my-1">
                        {p.metadata.description || 'No description'}
                      </p>
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

                  <footer className="flex items-center justify-between px-4 pt-4 text-right text-black">
                    <span className="flex items-center text-xs ">
                      By {p.profile.name} |
                    </span>
                    <span className="items-left flex text-left text-xs ">
                      {moment(p.createdAt).format('MMM D')} |
                    </span>

                    <span className="items-left flex text-left text-xs ">
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
                    <div className="flex w-2/4  ">
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

                      <button className=" mx-2 rounded-md bg-purple-400 px-2 py-1 text-xs font-semibold shadow-sm shadow-gray-400">
                        Collected
                      </button>
                    </div>
                  </footer>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    )
  );
}
