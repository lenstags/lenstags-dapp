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
    <div className="flex w-full items-center justify-between border-t px-6 py-2 transition-colors">
      <ArrowLeftIcon
        className={`h-4 w-4 text-stone-400  ${
          currentPage === 1 ? 'opacity-50' : 'hover:cursor-pointer'
        }
        `}
        aria-disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            paginate(currentPage - 1);
          }
        }}
      />
      <p className="text-center text-base text-stone-400">
        Page {currentPage} {totalPages > 1 ?? `to ${totalPages}`}
      </p>
      <ArrowRightIcon
        className={`h-4 w-4 text-stone-400  ${
          currentPage === totalPages ? 'opacity-50' : 'hover:cursor-pointer'
        }
        `}
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
