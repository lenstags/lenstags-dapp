import {
  BookmarkSquareIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

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
      style={{ fontSize: '12px' }}
      className="flex rounded-md bg-stone-100 px-3 py-1 font-serif font-medium"
    >
      <BookmarkSquareIcon color="black" height={14} width={14} />
      <div className="ml-1 mr-3">{collects}</div>

      <ChatBubbleLeftEllipsisIcon color="black" height={14} width={14} />
      <div className="ml-1 ">{comments}</div>
    </div>
  </>
);

export default PostIndicators;
