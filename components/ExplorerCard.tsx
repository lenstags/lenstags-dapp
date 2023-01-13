import React, { FC } from 'react';
import ImageProxied from './ImageProxied';
import moment from 'moment';
import { profile } from 'console';

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  return (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
      <article
        style={{ backgroundColor: '#F9F9F9' }}
        className="overflow-hidden rounded-lg shadow-lg
        animate-in slide-in-from-bottom duration-1000
        "
      >
        <header className="w-full items-center p-2 md:p-4">
          <div className="flex row w-full text-sm font-light text-black">
            <div className="col-span-3 mr-2">
              {
                <ImageProxied
                  category="profile"
                  title={`Loading from ${post.profile.picture?.original?.url}`}
                  alt="Profile"
                  height={50}
                  width={50}
                  objectFit="cover"
                  className="rounded-full w-12 h-12"
                  src={post.profile.picture?.original?.url}
                />
              }
            </div>
            <div className="col-span-1">
              <p className=" ">{post.profile.name || post.profile.id}</p>
              <p className="text-gray-400">@{post.profile.handle}</p>
            </div>
            <div className="col-span-1 text-right ">
              <span className=" text-xs text-gray-400 text-right">
                {moment(post.createdAt).format('MMM Do YY')}
              </span>
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
            className="block h-auto w-full rounded-b-lg"
            src={post.metadata.media[0]?.original.url}
          />

          <div className="mb-2 text-right">
            <span
              className="bg-gray-100 text-green-800 text-xs font-light mr-2 
          px-2.5 py-0.5 rounded "
            >
              {post.profile.stats?.totalCollects || '0'} Collected
            </span>
            <button
              className="bg-lime-200 text-green-800 text-xs font-light mr-2 
          px-2.5 py-0.5 rounded-lg hover:bg-lime-300"
            >
              Collect
            </button>
          </div>

          <div className="px-3 text-sm font-light">
            <a className=" text-black" href="#">
              <p>{post.metadata.title}</p>
              <p>{post.metadata.content}</p>
            </a>
          </div>
        </div>

        <footer className="flex justify-end items-center text-right text-black px-4 py-2">
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
          <span className="text-xs">
            {post.profile.stats?.totalComments || '0'}
          </span>
        </footer>
      </article>
    </div>
  );
};

export default ExploreCard;
