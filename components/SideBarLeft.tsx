import React, { useContext, useEffect, useState } from 'react';

import { SidebarContext } from '@context/SideBarSizeContext';
import { PublicRoutes } from 'models';
import { useSorts } from '@lib/hooks/use-sort';
import { getPublications } from '@lib/lens/get-publications';
import { PublicationTypes } from '@lib/lens/graphql/generated';
import { TextAlignBottomIcon } from '@radix-ui/react-icons';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDisconnect } from 'wagmi';
import { ProfileContext } from './LensAuthenticationProvider';
import PostsByList from './PostsByList';
import SidePanel, { sortBy } from './SidePanel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/Accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from './ui/Dropdown';
import { PlusSmallIcon } from '@heroicons/react/24/outline';
import { Tooltip } from './ui/Tooltip';

interface SidebarProps {}

const SideBarLeft: React.FC<SidebarProps> = () => {
  const { profile: lensProfile } = useContext(ProfileContext);
  const router = useRouter();
  const { setSidebarCollapsedState, sidebarCollapsedStateLeft } =
    useContext(SidebarContext);
  const [publications, setPublications] = useState<any[]>([]);
  const [sideBarSize, setSideBarSize] = useState<'3.6' | '16.6'>('16.6');
  const [sortByValue, setSortByValue] = useState('newest');
  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  const routesCollapsed =
    router.pathname === PublicRoutes.CREATE ||
    router.pathname.includes(PublicRoutes.LIST) ||
    router.pathname.includes(PublicRoutes.POST);

  useEffect(() => {
    if (router.pathname === PublicRoutes.MYPROFILE) {
      setSidebarCollapsedState({ collapsed: false });
      setSideBarSize('16.6');
    } else if (routesCollapsed) {
      setSidebarCollapsedState({ collapsed: true });
      setSideBarSize('3.6');
    }
  }, [
    router.pathname,
    sidebarCollapsedStateLeft.collapsed,
    setSidebarCollapsedState,
    routesCollapsed
  ]);

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  const fetchMyLists = async () => {
    if (!lensProfile) return;
    if (publications.length !== 0) return;
    const res = await getPublications([PublicationTypes.Post], lensProfile?.id);
    setPublications(
      res.items.filter(
        (r) =>
          (r.profile.id === lensProfile?.id &&
            r.metadata.attributes[0].value === 'list') ||
          r.metadata.attributes[0].value === 'privateDefaultList'
      )
    );
  };

  const { sortItems } = useSorts();
  const handleSort = (value: string) => {
    setSortByValue(value);
    sortItems({ items: publications, sort: value });
  };

  return (
    <div
      className={`bg-stone-100 sm:inline ${
        sidebarCollapsedStateLeft.collapsed
          ? 'col-span-1 w-24 animate-fadeRight'
          : 'col-span-2 animate-fadeLeft'
      }`}
    >
      <div className="sticky top-0 h-screen py-4">
        <div className="px-6 pb-6">
          <Link href={'/'}>
            {!sidebarCollapsedStateLeft.collapsed ? (
              <Image
                className="cursor-pointer"
                src="/img/landing/nata-logo.svg"
                alt=""
                width={150}
                height={40}
              />
            ) : (
              <Image
                className="mx-auto cursor-pointer"
                src="/img/landing/nata-isologo.svg"
                alt=""
                width={40}
                height={40}
              />
            )}
          </Link>
        </div>
        {/* menu items */}
        <div className="font-serif text-base">
          <Link href={'/app'}>
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

          <Link href={'/app'}>
            <Tooltip tooltip="Explore">
              <div
                className={`flex h-12 w-full cursor-pointer items-center gap-1 border-l-4 border-l-transparent
              hover:border-l-teal-100 hover:bg-teal-50 focus:border-l-teal-400 focus:font-bold active:font-bold ${
                sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
              }`}
              >
                <Image
                  src="/icons/explore.svg"
                  alt="Explore"
                  width={20}
                  height={20}
                />
                {!sidebarCollapsedStateLeft.collapsed && (
                  <span className="ml-2">Explore</span>
                )}
              </div>
            </Tooltip>
          </Link>

          {lensProfile && (
            <div className="animate-in fade-in-50 duration-1000 ">
              {router.pathname !== PublicRoutes.MYPROFILE ? (
                <SidePanel
                  fetchMyLists={fetchMyLists}
                  publications={publications}
                  sideBarSize={sideBarSize}
                />
              ) : (
                <Accordion type="single">
                  <AccordionItem value="my-investory" className="border-0 py-0">
                    <AccordionTrigger
                      onClick={() => {
                        fetchMyLists();
                      }}
                      className="h-12 gap-1 border-l-4 px-6 hover:border-l-teal-100 hover:bg-teal-50"
                      hiddenArrow
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
                </Accordion>
              )}
              <Link href={'/app'}>
                <Tooltip tooltip="Notifications">
                  <div
                    className={`flex h-12 cursor-pointer items-center gap-1 border-l-4 border-l-transparent hover:border-l-teal-100 hover:bg-teal-50 ${
                      sidebarCollapsedStateLeft.collapsed ? 'px-8' : 'px-6'
                    }`}
                  >
                    <Image
                      src="/icons/notifications.svg"
                      alt="Notifications"
                      width={20}
                      height={20}
                    />
                    {!sidebarCollapsedStateLeft.collapsed && (
                      <span className="ml-2">Notifications</span>
                    )}
                  </div>
                </Tooltip>
              </Link>

              <div className="flex px-6 py-4  ">
                <button
                  className={`w-full rounded-lg align-middle font-sans ${
                    sidebarCollapsedStateLeft.collapsed
                      ? 'h-12 w-12 text-4xl font-extralight'
                      : 'px-4 py-2'
                  } ${
                    router.pathname === PublicRoutes.CREATE
                      ? 'bg-white text-black'
                      : 'text-white'
                  }`}
                  onClick={() => {
                    router.push(PublicRoutes.CREATE);
                  }}
                >
                  {sidebarCollapsedStateLeft.collapsed ? (
                    <PlusSmallIcon />
                  ) : (
                    '+ Create'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBarLeft;
