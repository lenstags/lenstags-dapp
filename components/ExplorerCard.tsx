import React, { FC } from 'react';
import ImageProxied from './ImageProxied';
import moment from 'moment';
import { profile } from 'console';
import Link from 'next/link';

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {
  return (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3  ">
      {/* animate-in slide-in-from-bottom duration-1000 */}
      <article className="Lens_CardsDiv">
        <div className="bg-white Lens_Cards rounded-lg">
          <header className="w-full items-center p-2 md:py-4">
            <div className="flex row justify-between w-full text-sm font-light text-black">
              <div className="col-span-3  flex justify-between">
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
                  <p className=" ">{post.profile.name || post.profile.id} <span className="text-gray-400">{moment(post.createdAt).format('MMM Do YY')}</span> </p>
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
                        className="hover:text-lensGray2 rounded-t-lg bg-lensGray hover:bg-lensGray3 py-2 px-6 block whitespace-no-wrap"
                        href="#"
                      >
                        Share
                      </a>
                    </li>
                    <li className="">
                      <a
                        className="hover:text-lensGray2 rounded-b-lg bg-lensGray hover:bg-lensGray3 py-2 px-6 block whitespace-no-wrap"
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

          <figure className="cap-right">
          <ImageProxied
              category="post"
              height={400}
              width={600}
              objectFit="cover"
              className="block h-auto w-full"
              src={post.metadata.media[0]?.original.url}
            />
	<figcaption>
  <ul className=" pb-1 flex flex-wrap text-xs gap-1 ">
              {post.metadata.tags.map((tag: string) => (
                <li
                  key={tag}
                  className="rounded-lg border-2 py-1 bg-lensGray3 font-semibold border-lensBlack px-2 "
                >
                  {tag}
                </li>
              ))}
            </ul>
	</figcaption>
</figure>

          
          

          <div>
            <a className=" text-xl font-semibold text-lensBlack" href="#">
              {post.metadata.title}
              <div
                className=" text-base font-normal"
                dangerouslySetInnerHTML={{ __html: post.metadata.content }}
              ></div>
            </a>
          </div>

          

          <footer className="flex justify-between  items-center text-right text-lensBlack px-2 py-2">
            <div className="flex justify-start gap-2">
            <span className="text-xs flex items-center gap-1 text-lensBlack">
            <ImageProxied
                        category="profile"
                        src="/assets/icons/collected.svg"
                        alt="Comments"
                        width={20}
                        height={20}
                      />

              {post.profile.stats?.totalComments || ' 0'}
            </span>
            <span className="text-xs flex gap-1 items-center text-lensBlack">
            <ImageProxied
                        category="profile"
                        src="/assets/icons/comments.svg"
                        alt="Comments"
                        width={20}
                        height={20}
                      />

              {post.profile.stats?.totalComments || '0'}
            </span>
            </div>
           <div className="h-full flex items-center justify-center  border-black ">
                      <button className="flex align-middle ">
                        <Link href={'#collect'}>
                          <div className="button_cards flex">
                             <div>
                             <ImageProxied
                        category="profile"
                        src="/assets/icons/collect.svg"
                        alt="Collect"
                        width={20}
                        height={20}
                      />
                            </div>
                            <div>Collect</div>
                          </div>
                        </Link>
                      </button>
                    </div>

          </footer>
        </div>
      </article>
    </div>
  );
};

export default ExploreCard;
