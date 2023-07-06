import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import ProfileButton from './ProfileButton';
import { ProfileContext } from './LensAuthenticationProvider';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';

interface SidebarProps {
  position: 'left' | 'right';
}

const Sidebar: React.FC<SidebarProps> = ({ position }) => {
  const { openConnectModal } = useConnectModal();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
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
                className="flex h-12 cursor-pointer items-center gap-1 border-l-4 border-l-teal-400 bg-white
             px-6 font-bold hover:bg-teal-50
             
             "
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
                className="flex h-12 cursor-pointer items-center gap-1 border-l-4  border-l-stone-100 px-6
             hover:bg-teal-50"
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
                <Link href={'/my-profile'}>
                  <div
                    className="flex  h-12 cursor-pointer   items-center gap-1
              border-l-4 border-l-stone-100 px-6 hover:bg-teal-50"
                  >
                    <Image
                      src="/icons/inventory.svg"
                      alt="Inventory"
                      width={20}
                      height={20}
                    />
                    <span className="ml-2">My inventory</span>
                  </div>
                </Link>

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
