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
import { Ref, forwardRef, useContext, useState } from 'react';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import PostsByList from './PostsByList';
import { PublicRoutes } from 'models';
import { SidebarContext } from '@context/SideBarSizeContext';
import { Tooltip } from './ui/Tooltip';
import { useRouter } from 'next/router';
import { useSorts } from '@lib/hooks/use-sort';
import { FolderIcon } from '@heroicons/react/24/outline';
import { FolderIcon as FolderIconFilled } from '@heroicons/react/24/solid';
interface SidePanelProps {
  fetchMyLists: () => void;
  publications: any;
  sideBarSize: '3.6' | '16.6';
  notificationRef: any;
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

const SidePanelMyInventory = forwardRef(function (
  { fetchMyLists, publications, notificationRef }: SidePanelProps,
  ref: Ref<HTMLButtonElement> | undefined
) {
  const [sortByValue, setSortByValue] = useState('newest');
  const [open, setOpen] = useState(false);

  const { sortItems } = useSorts();
  const handleSort = (value: string) => {
    setSortByValue(value);
    sortItems({ items: publications, sort: value });
  };
  const {
    sidebarCollapsedStateLeft,
    setSidebarCollapsedState,
    setTriggerBy,
    triggerBy
  } = useContext(SidebarContext);

  const handleTrigger = () => {
    setSidebarCollapsedState({
      collapsed: true
    });
    if (publications.length === 0) fetchMyLists();
    setTriggerBy('my-inventory');
    setOpen(true);
  };

  const router = useRouter();

  const openSidebar =
    sidebarCollapsedStateLeft.collapsed &&
    (!router.pathname.includes(PublicRoutes.LIST) || open) &&
    (router.pathname !== PublicRoutes.CREATE || open) &&
    (!router.pathname.includes(PublicRoutes.POST) || open) &&
    triggerBy === 'my-inventory';

  return (
    <DoubleSidebar>
      <Tooltip tooltip="My inventory" id="radix-:r0:">
        <DoubleSidebarTrigger asChild onClick={handleTrigger} ref={ref}>
          <div
            id="radix-:r0:"
            className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent ${
              sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
            } hover:border-l-teal-100 hover:bg-teal-50 data-[state=open]:px-5 data-[state=open]:font-bold [&[data-state=open]>div]:rounded-xl [&[data-state=open]>div]:bg-white [&[data-state=open]>div]:p-3`}
          >
            <div id="radix-:r0:">
              {triggerBy === 'my-inventory' &&
              sidebarCollapsedStateLeft.collapsed ? (
                <FolderIconFilled
                  width={22}
                  height={22}
                  className="pointer-events-none text-lensBlack"
                  id="radix-:r0:"
                />
              ) : (
                <FolderIcon
                  width={22}
                  height={22}
                  className="pointer-events-none text-lensBlack"
                  id="radix-:r0:"
                />
              )}
            </div>

            {!sidebarCollapsedStateLeft.collapsed && (
              <span className="text-md ml-2" id="radix-:r0:">
                My inventory
              </span>
            )}
          </div>
        </DoubleSidebarTrigger>
      </Tooltip>
      <DoubleSidebarContent
        className={
          sidebarCollapsedStateLeft.collapsed
            ? 'w-80 p-0 py-6'
            : 'w-80 animate-fadeLeft'
        }
        onInteractOutside={(e) => {
          // @ts-ignore
          if (notificationRef.current.id === e.target?.id) return;
          // @ts-ignore
          if (e.target?.id === 'radix-:r0:' || e.target?.id.includes('radix'))
            return;
          setTimeout(() => {
            setTriggerBy('none');
            setOpen(false);
          }, 200);
        }}
      >
        <DoubleSidebarTitle className="flex items-center justify-center gap-2 px-6 font-serif">
          <div className="flex h-6 w-9 items-center justify-center rounded-full border border-lensBlack">
            <DoubleSidebarClose
              id="radix-:r0:"
              className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
              onClick={() => {
                setTriggerBy('none');
                setOpen(false);
              }}
            >
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
});

SidePanelMyInventory.displayName = 'SidePanelMyInventory';

export default SidePanelMyInventory;
