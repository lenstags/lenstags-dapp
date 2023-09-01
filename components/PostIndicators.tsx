import {
  BookmarkSquareIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

import ImageProxied from './ImageProxied';
import React from 'react';
import { cn } from '@lib/utils';

interface PostIndicatorsProps {
  collects: string;
  comments: string;
  className?: string;
}

const PostIndicators: React.FC<PostIndicatorsProps> = ({
  collects,
  comments,
  className
}) => (
  <>
    <div
      style={{ fontSize: '12px' }}
      className={cn(
        'flex items-center rounded-md px-3 py-1 font-serif font-medium',
        className
      )}
    >
      <BookmarkSquareIcon color="black" height={14} width={14} />
      <div className="ml-1 mr-3">{collects}</div>

      <ChatBubbleLeftEllipsisIcon color="black" height={14} width={14} />
      <div className="ml-1 ">{comments}</div>
    </div>
  </>
);

export default PostIndicators;
