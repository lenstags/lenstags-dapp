import React from 'react';

interface TagStripProps {
  tags: string[];
  postId: string;
}

const TagStrip: React.FC<TagStripProps> = ({ tags, postId }) => (
  <div
    style={{
      backdropFilter: 'blur(7px)',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px'
    }}
    className="scrollbar-thin scrollbar-lightgray-transparent flex w-full items-center gap-1 overflow-auto py-2 text-right text-xs"
  >
    {tags.map((tag: string) => {
      const tagValue = `${postId}${tag}`;
      return (
        <div
          key={tagValue}
          style={{
            fontSize: '8px',
            lineHeight: '12px',
            paddingTop: '3px',
            paddingBottom: '3px'
          }}
          className="whitespace-nowrap rounded-full border border-black bg-gray-50 px-2 font-serif font-bold tracking-wider"
        >
          {tag.replace('-', ' ').toUpperCase()}
        </div>
      );
    })}

    {(!tags || tags.length === 0) && (
      <div
        key={`${postId}untagged`}
        className=" rounded-md bg-lensGray px-2 italic shadow-sm shadow-lensGray2"
      ></div>
    )}
  </div>
);

export default TagStrip;
