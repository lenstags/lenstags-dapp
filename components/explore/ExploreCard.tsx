import React, { FC } from "react";

interface Props {
  post: any;
}

const ExploreCard: FC<Props> = ({ post }) => {

  const verifyUrlImage = (url: string) => {
    if (url?.includes("ipfs://")) {
      return url.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
    }
    return url;
  };

  return (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
      <article className="overflow-hidden rounded-lg shadow-lg">
        {post.metadata.media[0]?.original.url && (
          <img
            alt="Placeholder"
            className="block h-auto w-full"
            src={post.metadata.media[0]?.original.url}
          ></img>
        )}

        <header className="flex items-center justify-between leading-tight p-2 md:p-4">
          <h1 className="text-lg">
            <a className="no-underline hover:underline text-black" href="#">
              {post.metadata.content}
            </a>
          </h1>
          <p className="text-grey-darker text-sm">11/1/19</p>
        </header>

        <footer className="flex items-center justify-between leading-none p-2 md:p-4">
          <a
            className="flex items-center no-underline hover:underline text-black"
            href="#"
          >
            {post.profile.picture?.original?.url && (
              <img
                alt="Placeholder"
                className="block rounded-full w-10 h-10"
                src={verifyUrlImage(post.profile.picture?.original?.url)}
              ></img>
            )}
            <p className="ml-2 text-sm">{post.profile.handle}</p>
          </a>
          <a
            className="no-underline text-grey-darker hover:text-red-dark"
            href="#"
          >
            <span className="hidden">Like</span>
            <i className="fa fa-heart"></i>
          </a>
        </footer>
      </article>
    </div>
  );
};

export default ExploreCard;
