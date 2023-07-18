import {
  DoubleSidebar,
  DoubleSidebarClose,
  DoubleSidebarContent,
  DoubleSidebarHeader,
  DoubleSidebarTitle,
  DoubleSidebarTrigger
} from './ui/DoubleSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from './ui/Dropdown';
import {
  MagnifyingGlassIcon,
  TextAlignBottomIcon
} from '@radix-ui/react-icons';
import { useContext, useState } from 'react';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import PostsByList from './PostsByList';
import { PublicRoutes } from 'models';
import { SidebarContext } from '@context/SideBarSizeContext';
import { Tooltip } from './ui/Tooltip';
import { useRouter } from 'next/router';
import { useSorts } from '@lib/hooks/use-sort';
interface SidePanelProps {
  fetchMyLists: () => void;
  publications: any;
  sideBarSize: '3.6' | '16.6';
}

export const sortBy = [
  { name: 'Newest', value: 'newest' },
  { name: 'Alphabetical', value: 'alphabetical' },
  { name: 'Most collected', value: 'most-collected' }
];

export const actions = [
  { name: 'Go to list', value: 'go' },
  { name: 'Copy link', value: 'copy' },
  { name: 'Delete', value: 'delete' }
];

const SidePanel = ({ fetchMyLists, publications }: SidePanelProps) => {
  const [sortByValue, setSortByValue] = useState('newest');
  const [open, setOpen] = useState(false);

  const { sortItems } = useSorts();
  const handleSort = (value: string) => {
    setSortByValue(value);
    sortItems({ items: publications, sort: value });
  };
  const { sidebarCollapsedStateLeft, setSidebarCollapsedState } =
    useContext(SidebarContext);

  const handleTrigger = () => {
    setSidebarCollapsedState({
      collapsed: true
    });
    fetchMyLists();
    setOpen(true);
  };

  const router = useRouter();

  const openSidebar =
    sidebarCollapsedStateLeft.collapsed &&
    (!router.pathname.includes(PublicRoutes.LIST) || open) &&
    (router.pathname !== PublicRoutes.CREATE || open) &&
    (!router.pathname.includes(PublicRoutes.POST) || open);

  const styles = () => {
    if (
      router.pathname === PublicRoutes.CREATE ||
      router.pathname.includes(PublicRoutes.LIST) ||
      router.pathname.includes(PublicRoutes.POST)
    ) {
      return 'px-8';
    } else return 'px-6';
  };

  return (
    <DoubleSidebar
      open={openSidebar}
      onOpenChange={() => {
        setSidebarCollapsedState({
          collapsed: !sidebarCollapsedStateLeft.collapsed
        });
        setOpen(!open);
      }}
    >
      <Tooltip tooltip="My inventory">
        <DoubleSidebarTrigger asChild onClick={handleTrigger}>
          <div
            className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent hover:border-l-teal-100 hover:bg-teal-50 data-[state=open]:px-5 data-[state=open]:font-bold [&[data-state=open]>div]:rounded-xl [&[data-state=open]>div]:bg-white [&[data-state=open]>div]:p-3 ${styles()}`}
          >
            <div>
              <svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.0625 9.6875V9C1.0625 7.86091 1.98591 6.9375 3.125 6.9375H16.875C18.0141 6.9375 18.9375 7.86091 18.9375 9V9.6875M10.9723 3.78477L9.02773 1.84023C8.76987 1.58237 8.42013 1.4375 8.05546 1.4375H3.125C1.98591 1.4375 1.0625 2.36091 1.0625 3.5V14.5C1.0625 15.6391 1.98591 16.5625 3.125 16.5625H16.875C18.0141 16.5625 18.9375 15.6391 18.9375 14.5V6.25C18.9375 5.11091 18.0141 4.1875 16.875 4.1875H11.9445C11.5799 4.1875 11.2301 4.04263 10.9723 3.78477Z"
                  stroke="#121212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {!sidebarCollapsedStateLeft.collapsed && (
              <span className="text-md ml-2">My inventory</span>
            )}
          </div>
        </DoubleSidebarTrigger>
      </Tooltip>
      <DoubleSidebarContent
        className={
          sidebarCollapsedStateLeft.collapsed
            ? 'ml-24 w-80 p-0 py-6'
            : 'ml-24 w-80 animate-fadeLeft'
        }
      >
        <DoubleSidebarTitle className="flex items-center justify-center gap-2 px-6 font-serif">
          <div className="flex h-6 w-9 items-center justify-center rounded-full border border-lensBlack">
            <DoubleSidebarClose className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <ArrowLeftIcon className="h-4 w-4 text-lensBlack" />
            </DoubleSidebarClose>
          </div>
          <span className="text-md w-full">My Inventory</span>
          <Link
            href={'/my-profile'}
            className="rounded-lg bg-black px-5 py-1 text-xs text-white"
          >
            Go
          </Link>
        </DoubleSidebarTitle>
        <DoubleSidebarHeader className="relative my-6 flex w-full items-center justify-center gap-2 px-6">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-8 top-4 flex h-5 w-5 items-center text-lensGray2" />
          <input
            type="text"
            autoComplete="off"
            className="w-full rounded-full bg-stone-100 p-2 pl-9 leading-none outline-none"
            name="tag-search-input"
            id="tag-search-input"
            placeholder="Search..."
          />
        </DoubleSidebarHeader>
        <div className="mb-2 flex w-full justify-between gap-2 px-6">
          <span className="font-serif font-bold">LISTS</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <TextAlignBottomIcon className="h-4 w-4 text-lensBlack" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="flex w-40 flex-col gap-1 border-lensBlack px-2"
              align="start"
            >
              <DropdownMenuLabel className="select-none px-0 font-serif font-bold">
                SORT BY
              </DropdownMenuLabel>
              {sortBy.map((item) => (
                <DropdownMenuItem
                  className="cursor-pointer select-none px-0 font-serif outline-none"
                  key={item.value}
                  onClick={() => handleSort(item.value)}
                >
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <PostsByList publications={publications} className="pb-4" />
      </DoubleSidebarContent>
    </DoubleSidebar>
  );
};
export default SidePanel;
