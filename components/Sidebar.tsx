import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext, useState } from 'react';

import { PublicRoutes } from '@/models';
import { useSorts } from '@lib/hooks/use-sort';
import { getPublications } from '@lib/lens/get-publications';
import { PublicationTypes } from '@lib/lens/graphql/generated';
import { TextAlignBottomIcon } from '@radix-ui/react-icons';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDisconnect } from 'wagmi';
import ImageProxied from './ImageProxied';
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

interface SidebarProps {
  position: 'left' | 'right';
}

const Sidebar: React.FC<SidebarProps> = ({ position }) => {
  const { openConnectModal } = useConnectModal();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
  const router = useRouter();
  const [publications, setPublications] = useState<any[]>([]);
  const [sortByValue, setSortByValue] = useState('newest');
  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

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
      style={{
        ...(position === 'right' ? { width: '24.3333%' } : {})
      }}
      className={`fixed hidden h-screen sm:inline ${
        position === 'left' ? 'left-0 w-2/12 bg-stone-100 py-4 ' : 'right-0'
      } `}
    >
      {position === 'left' ? (
        <>
          <div className="px-6 pb-6">
            <Link href={'/'}>
              <Image
                className=" cursor-pointer  "
                src="/img/landing/nata-logo.svg"
                alt=""
                width={150}
                height={40}
              />
            </Link>
          </div>
          {/* menu items */}
          <div className="font-serif text-base">
            <Link href={'/app'}>
              <div
                className="flex h-12 cursor-pointer items-center gap-1 border-l-4 bg-white px-6
             hover:border-l-teal-100 hover:bg-teal-50 focus:border-l-teal-400 focus:font-bold active:font-bold"
              >
                <Image
                  src="/icons/home.svg"
                  alt="Home"
                  width={20}
                  height={20}
                />
                <span className="ml-2">Home</span>
              </div>
            </Link>

            <Link href={'/app'}>
              <div
                className="flex h-12 cursor-pointer items-center gap-1 border-l-4 
                px-6 hover:border-l-teal-100 hover:bg-teal-50 active:font-bold"
              >
                <Image
                  src="/icons/explore.svg"
                  alt="Explore"
                  width={20}
                  height={20}
                />
                <span className="ml-2">Explore</span>
              </div>
            </Link>

            {lensProfile && (
              <div className=" animate-in fade-in-50 duration-1000 ">
                {router.pathname !== PublicRoutes.MYPROFILE ? (
                  <SidePanel
                    fetchMyLists={fetchMyLists}
                    publications={publications}
                  />
                ) : (
                  <Accordion type="single">
                    <AccordionItem
                      value="my-investory"
                      className="border-0 py-0"
                    >
                      <AccordionTrigger
                        onClick={() => {
                          fetchMyLists();
                        }}
                        className="h-12 border-l-4 px-6 hover:border-l-teal-100 hover:bg-teal-50 data-[state=open]:border-l-teal-400 data-[state=open]:font-bold"
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
                      </AccordionTrigger>
                      <AccordionContent className="flex h-full flex-col border-0 outline-none">
                        <div className="flex w-full justify-between border-l-4 border-transparent px-6">
                          <span className="my-2 font-serif font-bold">
                            LISTS
                          </span>
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
                        <PostsByList publications={publications} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                <Link href={'/app'}>
                  <div
                    className="flex h-12 cursor-pointer items-center gap-1
              border-l-4 border-l-stone-100  px-6 hover:bg-teal-50"
                  >
                    <Image
                      src="/icons/notifications.svg"
                      alt="Notifications"
                      width={20}
                      height={20}
                    />
                    <span className="ml-2">Notifications</span>
                  </div>
                </Link>

                <div className="flex px-6 py-4  ">
                  <button className="w-full rounded-lg px-4 py-2 align-middle font-sans text-white">
                    <Link href={'/create'}>+ Create</Link>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mr-4 py-4">
          <ProfileButton />

          {/* top creators */}
          <div className="mt-2 rounded-t-lg bg-stone-200 py-4 pr-4">
            <div className=" rounded-lg pl-4">
              <div className=" flex items-baseline justify-between">
                <p className=" font-serif text-sm font-bold">Top Creators</p>
                <p className=" font-sans text-xs font-bold">View ranking</p>
              </div>
            </div>
          </div>
          <div className="mb-6 w-full bg-stone-100">...</div>

          <div className="rounded-t-lg bg-stone-200 py-4 pr-4">
            <div className=" rounded-lg pl-4">
              <div className=" flex items-baseline justify-between">
                <p className=" font-serif text-sm font-bold">
                  Recommended lists
                </p>
                <p className=" font-sans text-xs font-bold">View all</p>
              </div>
            </div>
          </div>
          <div className="mb-6 w-full bg-stone-100">...</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
