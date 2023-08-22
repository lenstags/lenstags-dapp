import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface PaginationProps {
  postsPerPage: number;
  totalPosts: number;
  paginate: (number: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  postsPerPage,
  totalPosts,
  paginate,
  currentPage
}) => {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  return (
    <div className="flex w-full items-center justify-between px-8 py-2">
      <ArrowLeftIcon
        className="h-5 w-5 hover:cursor-pointer"
        onClick={() => {
          if (currentPage > 1) {
            paginate(currentPage - 1);
          }
        }}
      />
      <p className="text-base text-stone-400">
        Page {currentPage} to {totalPages}
      </p>
      <ArrowRightIcon
        className="h-5 w-5 hover:cursor-pointer"
        onClick={() => {
          if (currentPage < totalPages) {
            paginate(currentPage + 1);
          }
        }}
      />
    </div>
  );
};
export default Pagination;
