import React, { FC } from 'react';
import ImageProxied from './ImageProxied';
import moment from 'moment';
import { profile } from 'console';

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  return (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3  ">
      {/* animate-in slide-in-from-bottom duration-1000 */}
      <article className="Lens_CardsDiv">
        <div className="bg-white Lens_Cards rounded-lg">
          <header className="w-full items-center p-2 md:p-4">
            <div className="flex row justify-between w-full text-sm font-light text-black">
              <div className="col-span-3 mr-2 flex justify-between">
                {
                  <ImageProxied
                    category="profile"
                    title={`Loading from ${post.profile.picture?.original?.url}`}
                    alt="Profile"
                    height={50}
                    width={50}
                    objectFit="cover"
                    className="cursor-pointer rounded-full w-12 h-12"
                    src={post.profile.picture?.original?.url}
                  />
                }
                <div className="col-span-1 pl-2 cursor-pointer">
                  <p className=" ">{post.profile.name || post.profile.id}</p>
                  <p className="text-gray-400">@{post.profile.handle}</p>
                </div>
              </div>

              <div className=" cursor-pointer ">
                {/* <ImageProxied
                      category="profile"
                      src="/assets/icons/dots-vertical.svg"
                      alt="Lenstags Logo"
                      width={20}
                      height={20}
                    /> */}

                <div className="dropdown inline-block relative">
                  <div className=" text-gray-700 font-semibold py-2  rounded  items-center">
                    <span className="">
                      <ImageProxied
                        category="profile"
                        src="/assets/icons/dots-vertical.svg"
                        alt="Lenstags Logo"
                        width={20}
                        height={20}
                      />
                    </span>
                  </div>
                  <ul className="dropdown-menu right-1 z-10 absolute hidden text-lensBlack  rounded-lg border-2 border-lensBlack ">
                    <li className="">
                      <a
                        className="hover:text-lensGray rounded-t-lg bg-lensGray hover:bg-lensGray2 py-2 px-4 block whitespace-no-wrap"
                        href="#"
                      >
                        Share
                      </a>
                    </li>
                    <li className="">
                      <a
                        className="hover:text-lensGray rounded-b-lg bg-lensGray hover:bg-lensGray2 py-2 px-4 block whitespace-no-wrap"
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
          </div>
          <div className="mb-2 flex justify-between">
            <div
              className="bg-lime-200 text-green-800 text-xs font-light mr-2 
          px-2 py-0.5 rounded-lg hover:bg-lime-300"
            >
              12 Collected
            </div>
          </div>
          <div className="px-3 text-sm font-light">
            <a className=" text-black" href="#">
              <p>{post.metadata.title}</p>
              <div
                dangerouslySetInnerHTML={{ __html: post.metadata.content }}
              ></div>
            </a>
          </div>

          <div>
            <ul className=" py-2 flex flex-wrap text-xs gap-1">
              {post.metadata.tags.map((tag: string) => (
                <li
                  key={tag}
                  className="rounded-lg border-2 bg-lensGreen font-semibold border-lensBlack px-2 "
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <footer className="flex justify-between  items-center text-right text-black px-4 py-2">
            <span className="text-xs flex items-center ">
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
              className="bg-lime-200 text-green-800 text-xs font-light mr-2 
          px-2.5 py-0.5 rounded-lg hover:bg-lime-300"
            >
              Collect
            </button>
          </footer>
        </div>
      </article>
    </div>
  );
};

export default ExploreCard;
