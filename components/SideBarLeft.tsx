import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/Accordion';
import {
  BellIcon,
  FolderIcon,
  GlobeAltIcon,
  PlusSmallIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellIconFilled,
  FolderIcon as FolderIconFilled,
  GlobeAltIcon as GlobeAltIconFilled
} from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from './ui/Dropdown';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SidePanelMyInventory, { sortBy } from './SidePanelMyInventory';
import {
  channelAddress,
  getNotifications,
  getSubscriptions,
  optIn
} from '@lib/lens/user-notifications';

import { APP_UI_VERSION } from '@lib/config';
import Image from 'next/image';
import Link from 'next/link';
import Notifications from './Notifications';
import PostsByList from './PostsByList';
import { ProfileContext } from './LensAuthenticationProvider';
import { PublicRoutes } from 'models';
import { PublicationTypes } from '@lib/lens/graphql/generated';
import SidePanelNotifications from './SidePanelNotifications';
import { SidebarContext } from '@context/SideBarSizeContext';
import { TextAlignBottomIcon } from '@radix-ui/react-icons';
import { Tooltip } from './ui/Tooltip';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import { getPublications } from '@lib/lens/get-publications';
import { getSigner } from '@lib/lens/ethers.service';
import { getUserLists } from '@lib/lens/load-lists';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import { useSorts } from '@lib/hooks/use-sort';

interface SidebarProps {}

const SideBarLeft: React.FC<SidebarProps> = () => {
  const { profile: lensProfile } = useContext(ProfileContext);
  const router = useRouter();
  const { sidebarCollapsedStateLeft } = useContext(SidebarContext);
  const [publications, setPublications] = useState<any[]>([]);
  const [sideBarSize, setSideBarSize] = useState<'3.6' | '16.6'>('16.6');
  const [openTo, setOpenTo] = useState<
    'my-inventory' | 'notifications' | 'none'
  >('none');
  const [sortByValue, setSortByValue] = useState('newest');
  const [subcribed, setSubcribed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingMyLists, setLoadingMyLists] = useState(false);
  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  const triggerNotificationsRef = useRef<any>();
  const triggerMyInventoryRef = useRef<any>();

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  const fetchMyLists = async () => {
    if (!lensProfile) return;

    const parsedLists = await getUserLists(lensProfile.id);

    if (!parsedLists) {
      return;
    }

    if (publications.length !== 0) return;
    setLoadingMyLists(true);
    const res = await getPublications([PublicationTypes.Post], lensProfile?.id);
    console.log('xxx ', res);

    // FIXME
    // return getPopulatedLists(lensProfile.id);

    const filteredItems = res.items.filter((item: any) => {
      const id = lensProfile?.id;
      const attributes = item.metadata.attributes;
      return (
        item.profile.id === id &&
        attributes?.length > 0 &&
        (attributes[0].value === 'list' ||
          attributes[0].value === 'privateDefaultList')
      );
    });

    setPublications(filteredItems);
    setLoadingMyLists(false);
  };

  const { sortItems } = useSorts();
  const handleSort = (value: string) => {
    setSortByValue(value);
    sortItems({ items: publications, sort: value });
  };

  const handleOpenMyInventory = () => {
    if (publications.length === 0) {
      fetchMyLists();
    }
    setOpenTo('my-inventory');
  };

  useEffect(() => {
    getSubscriptions(lensProfile?.ownedBy).then((res: any) => {
      const channelNataSocial =
        res &&
        !!res.find(
          (item: { channel: string }) =>
            item.channel === '0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3'
        );
      setSubcribed(channelNataSocial);
    });
  }, [lensProfile?.ownedBy]);

  const signer = getSigner();

  const handleOpenNotifications = () => {
    setOpenTo('notifications');
    if (!subcribed) {
      optIn(lensProfile?.ownedBy, signer).then((res) => {
        setSubcribed(true);
      });
    }
    if (notifications.length === 0) {
      getNotifications(lensProfile?.ownedBy).then((res) => {
        setNotifications(res);
      });
    }
  };

  return (
    <div
      className={`bg-stone-100  sm:inline ${
        sidebarCollapsedStateLeft.collapsed
          ? 'z-[100] col-span-1 w-24 ease-in animate-in'
          : 'col-span-2 animate-fadeLeft'
      }`}
    >
      <div className="pointer-events-auto sticky top-0 h-screen py-4">
        <div className="px-6 pb-6">
          <Link href={'/'} className="h-full">
            {!sidebarCollapsedStateLeft.collapsed ? (
              <Image
                data-open={!sidebarCollapsedStateLeft.collapsed}
                className="cursor-pointer data-[open=false]:animate-fadeOutLogo"
                src="/img/landing/nata-logo.svg"
                alt=""
                width={150}
                height={40}
              />
            ) : (
              <Image
                className="mx-auto cursor-pointer duration-5000 ease-in"
                src="/img/landing/nata-isologo.svg"
                alt=""
                width={40}
                height={40}
                style={{ width: '40px', height: '40px' }}
              />
            )}
          </Link>
        </div>
        {/* menu items */}
        <div className="font-serif text-base">
          <Link href={PublicRoutes.APP}>
            <Tooltip tooltip="Home">
              <div
                className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent
             hover:border-l-teal-100 hover:bg-teal-50 focus:border-l-teal-400 focus:font-bold active:font-bold ${
               sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
             }`}
              >
                <Image
                  src="/icons/home.svg"
                  alt="Home"
                  width={20}
                  height={20}
                />
                {!sidebarCollapsedStateLeft.collapsed && (
                  <span className="ml-2">Home</span>
                )}
              </div>
            </Tooltip>
          </Link>

          <Link href={PublicRoutes.APP}>
            <Tooltip tooltip="Explore">
              <div
                className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent
              hover:border-l-teal-100 hover:bg-teal-50 focus:border-l-teal-400 focus:font-bold active:font-bold ${
                sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
              }`}
              >
                {router.pathname === PublicRoutes.APP &&
                !sidebarCollapsedStateLeft.collapsed ? (
                  <GlobeAltIconFilled
                    width={22}
                    height={22}
                    className="text-lensBlack"
                  />
                ) : (
                  <GlobeAltIcon
                    width={22}
                    height={22}
                    className="text-lensBlack"
                  />
                )}
                {!sidebarCollapsedStateLeft.collapsed && (
                  <span className="ml-2">Explore</span>
                )}
              </div>
            </Tooltip>
          </Link>

          {lensProfile && router.pathname !== PublicRoutes.MYPROFILE ? (
            <div className="h-12 w-full duration-1000 animate-in fade-in-50">
              <SidePanelMyInventory
                fetchMyLists={fetchMyLists}
                publications={publications}
                sideBarSize={sideBarSize}
                notificationRef={triggerNotificationsRef}
                loadingMyLists={loadingMyLists}
                ref={triggerMyInventoryRef}
              />
            </div>
          ) : (
            lensProfile && (
              <div className="w-full duration-1000 animate-in fade-in-50">
                <Accordion type="single">
                  <AccordionItem value="my-investory" className="border-0 py-0">
                    <AccordionTrigger
                      onClick={handleOpenMyInventory}
                      className="h-12 gap-1 border-l-4  border-l-transparent px-6 hover:border-l-teal-100 hover:bg-teal-50"
                      hiddenArrow
                    >
                      {openTo === 'my-inventory' ? (
                        <FolderIconFilled
                          width={22}
                          height={22}
                          className="text-lensBlack"
                        />
                      ) : (
                        <FolderIcon
                          width={22}
                          height={22}
                          className="text-lensBlack"
                        />
                      )}
                      {!sidebarCollapsedStateLeft.collapsed && (
                        <span className="ml-2 text-base font-normal">
                          My inventory
                        </span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="flex h-full flex-col border-0 outline-none">
                      <div className="flex w-full justify-between border-l-4 border-transparent px-6">
                        <span className="my-2 font-serif font-bold">LISTS</span>
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
                      <PostsByList
                        publications={publications}
                        className="-mb-4"
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="notifications"
                    className="border-0 py-0"
                  >
                    <AccordionTrigger
                      onClick={handleOpenNotifications}
                      className="h-12 gap-1 border-l-4  border-l-transparent px-6 hover:border-l-teal-100 hover:bg-teal-50"
                      hiddenArrow
                    >
                      {openTo === 'notifications' ? (
                        <BellIconFilled
                          width={22}
                          height={22}
                          className="text-lensBlack"
                        />
                      ) : (
                        <BellIcon
                          width={22}
                          height={22}
                          className="text-lensBlack"
                        />
                      )}
                      {!sidebarCollapsedStateLeft.collapsed && (
                        <span className="ml-2 text-base font-normal">
                          Notifications
                        </span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="flex h-full flex-col border-0 outline-none">
                      <div className="mb-2 ml-1 flex h-full w-full flex-col gap-2 overflow-x-scroll px-6 py-2">
                        {notifications.length > 0 &&
                          notifications.map((notif, index: number) => {
                            return <Notifications notif={notif} key={index} />;
                          })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )
          )}

          {lensProfile && router.pathname !== PublicRoutes.MYPROFILE && (
            <div className="h-12 w-full duration-1000 animate-in fade-in-50">
              <SidePanelNotifications
                ref={triggerNotificationsRef}
                myInventoryRef={triggerMyInventoryRef}
              />
            </div>
          )}

          {lensProfile && !sidebarCollapsedStateLeft.collapsed && (
            <div className="flex w-full items-center justify-center py-4">
              <button
                className={`rounded-lg align-middle font-sans ${
                  sidebarCollapsedStateLeft.collapsed
                    ? 'h-10 w-10 font-extralight'
                    : 'mx-6 w-full px-4 py-2'
                } ${
                  router.pathname === PublicRoutes.CREATE
                    ? 'bg-white text-black'
                    : 'text-white'
                }`}
                onClick={() => {
                  router.push(PublicRoutes.CREATE);
                }}
              >
                + Create
              </button>
            </div>
          )}
          {lensProfile &&
            router.pathname !== PublicRoutes.CREATE &&
            sidebarCollapsedStateLeft.collapsed && (
              <Link href={PublicRoutes.CREATE}>
                <Tooltip tooltip="Create" className="my-4 h-10">
                  <button className="h-10 w-10 rounded-lg bg-lensBlack">
                    <PlusSmallIcon className="text-white" />
                  </button>
                </Tooltip>
              </Link>
            )}
        </div>
      </div>
      <div className="fixed bottom-0 w-full bg-transparent px-6 py-4 font-mono text-xs text-gray-300">
        {APP_UI_VERSION}
      </div>
    </div>
  );
};

export default SideBarLeft;
