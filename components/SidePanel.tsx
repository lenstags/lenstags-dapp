import { ArrowLeftIcon } from 'lucide-react';
import {
  DoubleSidebar,
  DoubleSidebarClose,
  DoubleSidebarContent,
  DoubleSidebarHeader,
  DoubleSidebarTitle,
  DoubleSidebarTrigger
} from './ui/DoubleSidebar';
import Link from 'next/link';
import {
  ChevronRightIcon,
  DotsHorizontalIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  TextAlignBottomIcon
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from './ui/Dropdown';
interface SidePanelProps {
  fetchMyLists: () => void;
  publications: any;
}

const SidePanel = ({ fetchMyLists, publications }: SidePanelProps) => {
  return (
    <DoubleSidebar>
      <DoubleSidebarTrigger asChild onClick={() => fetchMyLists()}>
        <div
          className="flex h-12 w-full cursor-pointer items-center gap-1 
                    border-l-4 px-6 hover:border-l-teal-100 hover:bg-teal-50 data-[state=open]:border-l-teal-400 data-[state=open]:font-bold"
        >
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

          <span className="text-md ml-2">My inventory</span>
        </div>
      </DoubleSidebarTrigger>
      <DoubleSidebarContent className="px-0">
        <DoubleSidebarTitle className="flex items-center justify-center gap-2 px-6 font-serif">
          <div className="flex h-6 w-9 items-center justify-center rounded-full border border-lensBlack">
            <DoubleSidebarClose className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <ArrowLeftIcon className="h-4 w-4 text-lensBlack" />
            </DoubleSidebarClose>
          </div>
          <span className="text-md w-full">My Iventory</span>
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
              <DropdownMenuItem className="cursor-pointer select-none font-serif outline-none">
                Recents
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer select-none font-serif outline-none">
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer select-none font-serif outline-none">
                Most collected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-1">
          {publications?.map((list: any) => (
            <div
              key={list.id}
              className="group flex h-11 w-full cursor-pointer items-center justify-between border-l-4 border-transparent px-6 hover:border-l-teal-400 hover:bg-teal-50"
            >
              <div className="flex items-center gap-2">
                <ChevronRightIcon className="h-5 w-5 text-lensBlack" />
                <span className="text-md ml-2 group-hover:font-bold">
                  {list.metadata.name}
                </span>
              </div>
              <div className="flex gap-2">
                <LockClosedIcon className="h-4 w-4 text-lensBlack opacity-0  group-hover:opacity-100" />
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none data-[state=open]:bg-teal-400">
                    <DotsHorizontalIcon className="h-4 w-4 text-lensBlack opacity-0 group-open:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="flex w-40 flex-col gap-2 border-lensBlack p-4"
                    align="start"
                  >
                    <DropdownMenuItem className="cursor-pointer select-none outline-none">
                      Go to list
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer select-none outline-none">
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer select-none outline-none">
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer select-none outline-none">
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer select-none outline-none">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </DoubleSidebarContent>
    </DoubleSidebar>
  );
};
export default SidePanel;
