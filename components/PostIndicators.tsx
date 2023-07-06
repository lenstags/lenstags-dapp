import ImageProxied from './ImageProxied';
import React from 'react';

interface PostIndicatorsProps {
  collects: string;
  comments: string;
}

const PostIndicators: React.FC<PostIndicatorsProps> = ({
  collects,
  comments
}) => (
  <>
    <div
      style={{ fontSize: '10px' }}
      className="flex rounded-md bg-stone-100 px-3 py-1 font-serif"
    >
      <ImageProxied
        category="profile"
        src="/assets/icons/collect.svg"
        alt="Collect"
        title="Total amount of collects"
        width={12}
        height={12}
      />
      <div className="ml-1 mr-3">{collects}</div>

      <ImageProxied
        category="profile"
        src="/assets/icons/comments.svg"
        alt="Comments"
        title="Comments"
        width={15}
        height={12}
      />
      <div className="ml-1 ">{comments}</div>
    </div>
  </>
);

export default PostIndicators;
