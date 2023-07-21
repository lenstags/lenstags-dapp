import { Ref, forwardRef, useContext, useMemo, useState } from 'react';
import {
  DoubleSidebar,
  DoubleSidebarClose,
  DoubleSidebarContent,
  DoubleSidebarHeader,
  DoubleSidebarTitle,
  DoubleSidebarTrigger
} from './ui/DoubleSidebar';

import { SidebarContext } from '@context/SideBarSizeContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconFilled } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from 'lucide-react';
import { PublicRoutes } from 'models';
import { useRouter } from 'next/router';
import { Tooltip } from './ui/Tooltip';
interface SidePanelProps {
  myInventoryRef: any;
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

const SidePanelNotifications = forwardRef(function (
  { myInventoryRef }: SidePanelProps,
  ref: Ref<HTMLDivElement> | undefined
) {
  const [open, setOpen] = useState(false);

  const {
    sidebarCollapsedStateLeft,
    setSidebarCollapsedState,
    triggerBy,
    setTriggerBy
  } = useContext(SidebarContext);

  const handleTrigger = () => {
    setSidebarCollapsedState({
      collapsed: true
    });
    setTriggerBy('notification');
    setOpen(true);
  };

  return (
    <DoubleSidebar>
      <Tooltip tooltip="Notifications" id="radix-:r3:">
        <DoubleSidebarTrigger asChild onClick={handleTrigger}>
          <div
            ref={ref}
            id="radix-:r3:"
            className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent ${
              sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
            } hover:border-l-teal-100 hover:bg-teal-50 data-[state=open]:px-5 data-[state=open]:font-bold [&[data-state=open]>div]:rounded-xl [&[data-state=open]>div]:bg-white [&[data-state=open]>div]:p-3`}
          >
            <div id="radix-:r3:">
              {triggerBy === 'notification' &&
              sidebarCollapsedStateLeft.collapsed ? (
                <BellIconFilled
                  width={22}
                  height={22}
                  className="pointer-events-none text-lensBlack"
                  id="radix-:r3:"
                />
              ) : (
                <BellIcon
                  width={22}
                  height={22}
                  className="pointer-events-none text-lensBlack"
                  id="radix-:r3:"
                />
              )}
            </div>

            {!sidebarCollapsedStateLeft.collapsed && (
              <span className="text-md ml-2">Notifications</span>
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
        onInteractOutside={(e) => {
          // @ts-ignore
          if (myInventoryRef.current.id === e.target?.id) return;
          // @ts-ignore
          if (e.target?.id === 'radix-:r3:') return;
          console.log('outside', e.target);
          setTimeout(() => {
            setTriggerBy('none');
            setOpen(false);
          }, 100);
        }}
      >
        <DoubleSidebarTitle className="flex items-center justify-center gap-2 px-6 font-serif">
          <div className="flex h-6 w-7 items-center justify-center rounded-full border border-lensBlack">
            <DoubleSidebarClose
              id="radix-:r3:"
              className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
              <ArrowLeftIcon className="h-4 w-4 text-lensBlack" />
            </DoubleSidebarClose>
          </div>
          <span className="text-md w-full">Notifications</span>
        </DoubleSidebarTitle>
        <DoubleSidebarHeader className="relative my-6 flex w-full items-center justify-center gap-2 px-6"></DoubleSidebarHeader>
        <div className="mb-2 flex w-full justify-between gap-2 px-6">
          <span className="font-serif font-bold">LISTS</span>
        </div>
      </DoubleSidebarContent>
    </DoubleSidebar>
  );
});

SidePanelNotifications.displayName = 'SidePanelNotifications';

export default SidePanelNotifications;
