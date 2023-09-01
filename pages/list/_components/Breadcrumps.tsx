import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { PublicRoutes } from '@models/routes.model';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

interface BreadcrumpsProps {
  listName?: string;
  breadcumpTitle?: string;
  fromList?: boolean;
}
const Breadcrumps: React.FC<BreadcrumpsProps> = ({
  listName,
  breadcumpTitle,
  fromList
}) => {
  const router = useRouter();
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        <li className="mr-1 inline-flex items-center">
          <Link
            href={PublicRoutes.APP}
            className="inline-flex items-center text-sm font-medium text-stone-400"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
        </li>
        {fromList && (
          <li
            className="mr-1 flex cursor-pointer items-center"
            onClick={() => router.back()}
          >
            <ChevronRightIcon className="h-5 w-5 text-stone-400" />
            <p className="ml-1 select-none text-base font-medium text-stone-400">
              List 1
            </p>
          </li>
        )}
        <li className="mr-1 flex items-center">
          <ChevronRightIcon className="h-5 w-5 text-stone-400" />
          <p className="ml-1 select-none text-base font-medium text-stone-400">
            {listName && listName.length > 0 ? listName : breadcumpTitle}
          </p>
        </li>
      </ol>
    </nav>
  );
};
export default Breadcrumps;
