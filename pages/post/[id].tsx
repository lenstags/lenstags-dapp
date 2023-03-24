import { useEffect, useState } from 'react';

import ImageProxied from 'components/ImageProxied';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { useRouter } from 'next/router';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  console.log('el id: ', id);
  useEffect(() => {
    const fetchData = async () => {
      // const storedObject = localStorage.getItem('LENS_POST') || '';
      // const myObject = JSON.parse(storedObject);
      // console.log(myObject);

      // get post object
      const oo = await getPublication(id as string);
      setPost(oo);
      console.log('oo post: ', oo);
    };

    fetchData().catch(console.error);
  }, [id]);

  return (
    post && (
      <div className="m-4">
        <article className=" rounded-lg border-2 border-solid border-black bg-white p-4">
          <header className="w-full items-center p-2 md:p-4">
            <div className="row flex w-full justify-between text-sm font-light text-black">
              <div className="col-span-3 mr-2 flex justify-between">
                {
                  <ImageProxied
                    category="profile"
                    title={`Loading...`}
                    alt="Profile"
                    height={50}
                    width={50}
                    objectFit="cover"
                    className="h-12 w-12 cursor-pointer rounded-full"
                    src={post.profile.picture?.original?.url}
                  />
                }
                <div className="col-span-1 cursor-pointer pl-2">
                  <p className=" ">{post.profile.name || post.profile.id}</p>
                  <p className="text-gray-400">@{post.profile.handle}</p>
                </div>
              </div>

              <div className=" cursor-pointer ">
                {/* <ImageProxied
                      category="profile"
                      src="/assets/icons/dots-vertical.svg"
                      alt=""
                      width={20}
                      height={20}
                    /> */}

                <div className="dropdown relative inline-block">
                  <div className=" items-center rounded py-2  font-semibold  text-gray-700">
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
              {/* <div className="col-span-1 text-right">icons</div> */}
            </div>
          </header>
          <div>
            <ImageProxied
              category="post"
              height={400}
              width={600}
              objectFit="cover"
              className="block h-auto w-full"
              src={post.metadata.media[0]?.original.url}
            />
            <div className="mb-2 flex justify-between">
              <div
                className="mr-2 rounded-lg border-2  border-lensBlack bg-lensGray3 px-2 
          py-0.5 text-xs font-light"
              >
                12 Collected
              </div>
              <div
                className="rounded-lg border-2 border-lensBlack bg-lensGray px-2 py-0.5  
           text-xs font-light"
              >
                {moment(post.createdAt).format('MMM Do YY')}
              </div>
            </div>

            <div>
              <p className=" font-bold text-lensBlack">
                {post.metadata.name || 'untitled'}
              </p>
              <p className="text-sm  font-thin text-gray-500">
                {post.metadata.description || 'no-description'}
              </p>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: post.metadata.content }}
            ></div>

            <div>
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
            </div>
          </div>

          <footer className="flex items-center  justify-between px-4 py-2 text-right text-black">
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

              {post.profile.stats?.totalComments || '0'}
            </span>

            <button
              className="mr-2 rounded-lg border-2  border-solid border-lensBlack   bg-lensPurple px-2.5 py-0.5 
          text-xs font-light text-lensGray hover:bg-lensGray2"
            >
              Collect
            </button>
          </footer>
        </article>
      </div>
    )
  );
}
