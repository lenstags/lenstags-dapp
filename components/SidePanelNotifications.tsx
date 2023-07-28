import { Ref, forwardRef, useContext, useState } from 'react';
import {
  DoubleSidebar,
  DoubleSidebarContent,
  DoubleSidebarTitle,
  DoubleSidebarTrigger
} from './ui/DoubleSidebar';

import { SidebarContext } from '@context/SideBarSizeContext';
import {
  BellIcon,
  BookmarkSquareIcon,
  UserPlusIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconFilled } from '@heroicons/react/24/solid';
import { getNotifications } from '@lib/lens/user-notifications';
import * as PushAPI from '@pushprotocol/restapi';
import { useAccount } from 'wagmi';
import { Tooltip } from './ui/Tooltip';
import { NotificationTypes } from '@models/notifications.models';

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

interface notifToIconMapType {
  [key: string]: JSX.Element;
}

const notifToIconMap: notifToIconMapType = {
  [NotificationTypes.CollectedPost]: (
    <BookmarkSquareIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.Followed]: (
    <UserPlusIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.CommentedPost]: (
    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.CollectedList]: (
    <BookOpenIcon className="h-6 w-6 text-lensBlack" />
  )
};

const SidePanelNotifications = forwardRef(function (
  { myInventoryRef }: SidePanelProps,
  ref: Ref<HTMLDivElement> | undefined
) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    PushAPI.ParsedResponseType[]
  >([]);
  const { address } = useAccount();

  const {
    sidebarCollapsedStateLeft,
    setSidebarCollapsedState,
    triggerBy,
    setTriggerBy
  } = useContext(SidebarContext);

  const handleTrigger = () => {
    if (notifications.length === 0)
      getNotifications(address).then((res) => {
        setNotifications(res);
      });
    setSidebarCollapsedState({
      collapsed: true
    });
    setTriggerBy('notification');
    setOpen(true);
  };

  console.log(notifications);
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
          setTimeout(() => {
            setTriggerBy('none');
            setOpen(false);
          }, 100);
        }}
      >
        <DoubleSidebarTitle className="mb-4 flex items-center justify-center gap-2 px-6 font-serif">
          {/* <div className="flex h-6 w-7 items-center justify-center rounded-full border border-lensBlack">
            <DoubleSidebarClose
              id="radix-:r3:"
              className="opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
              onClick={() => {
                setTriggerBy('none');
                setOpen(false);
              }}
            >
              <ArrowLeftIcon className="h-4 w-4 text-lensBlack" />
            </DoubleSidebarClose>
          </div> */}
          <span className="text-md w-full">Notifications</span>
        </DoubleSidebarTitle>
        <div className="mb-2 flex w-full flex-col justify-between gap-2 px-6">
          {notifications.length > 0 &&
            notifications.map((notif, index: number) => {
              return (
                <div
                  className="my-2 flex w-full items-center gap-2"
                  key={notif.sid}
                >
                  {notifToIconMap[notif.cta]}
                  <span className="w-full truncate text-ellipsis text-[14px]">
                    <span className="font-bold text-black">{notif.title}</span>{' '}
                    {notif.notification.body}
                  </span>
                </div>
              );
            })}
        </div>
      </DoubleSidebarContent>
    </DoubleSidebar>
  );
});

SidePanelNotifications.displayName = 'SidePanelNotifications';

export default SidePanelNotifications;
