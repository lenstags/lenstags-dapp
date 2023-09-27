import React, { useContext, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { getPictureUrl } from 'utils/helpers';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import useDisconnector from '@lib/hooks/useDisconnector';

const ProfileButton = ({ className }: { className?: string }) => {
  const { openConnectModal } = useConnectModal();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
  const { handleDisconnect } = useDisconnector();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      buttonRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as HTMLElement)
    ) {
      setProfileView(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div id="connectArea" className={`bg-white text-right ${className}`}>
      {lensProfile ? (
        <>
          <button
            ref={buttonRef}
            onClick={() => setProfileView(!profileView)}
            className="group
                   rounded-lg border border-solid bg-transparent align-middle"
          >
            <div className="flex items-center">
              <ImageProxied
                category="profile"
                className="h-10 w-10 rounded-lg object-cover"
                src={getPictureUrl(lensProfile)}
                alt="avatar"
                width={100}
                height={100}
              />
              <div
                className={`transition-max-width max-w-0 overflow-hidden font-serif font-medium text-[#121212] opacity-0 transition-opacity duration-500 ease-in-out group-hover:mx-3 group-hover:max-w-full group-hover:opacity-100 ${
                  profileView && 'mx-3 hidden max-w-full opacity-100'
                }`}
              >
                @{lensProfile?.handle}
              </div>
              {profileView && (
                <p className="mx-3 font-serif font-medium text-[#121212]">
                  @{lensProfile?.handle}
                </p>
              )}
            </div>
          </button>

          {/* profile menu */}
          {profileView && (
            <div ref={menuRef} className="absolute right-0 z-20 mt-2 w-[14rem]">
              <div className="justify-end rounded-md border border-black bg-white pb-2 pt-1">
                <div className="my-3 flex items-center px-4">
                  <ImageProxied
                    category="profile"
                    className="mx-1 h-6 w-6 rounded-full object-cover"
                    src={getPictureUrl(lensProfile)}
                    alt="avatar"
                    width={40}
                    height={40}
                  />
                  <div className="pl-2">
                    <p className="w-40 text-left font-serif text-base font-bold">
                      {`${lensProfile?.ownedBy.slice(
                        0,
                        6
                      )}...${lensProfile?.ownedBy.slice(-4)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-start px-6 py-2   hover:bg-teal-100">
                  <Image
                    src="/icons/my-profile.svg"
                    alt="My profile"
                    width={18}
                    height={18}
                  />
                  <div className="pl-3">
                    <Link href={'/my-profile'}>My Profile</Link>
                  </div>
                </div>

                <div className="flex items-center justify-start  px-6 py-2  hover:bg-teal-100">
                  <Image
                    src="/icons/settings.svg"
                    alt="Settings"
                    width={18}
                    height={18}
                  />

                  <div className="pl-3">
                    <Link href={'/settings'} className="">
                      Settings
                    </Link>
                  </div>
                </div>

                <div className=" flex items-center justify-start  px-6 py-2  hover:bg-teal-100">
                  <Image
                    src="/icons/help.svg"
                    alt="Help"
                    width={18}
                    height={18}
                  />
                  <div className="cursor-pointer pl-3">Help</div>
                </div>

                <div className=" flex items-center justify-start  px-6 py-2  hover:bg-teal-100">
                  <Image
                    src="/icons/logout.svg"
                    alt="Logout"
                    width={18}
                    height={18}
                  />
                  <div
                    className="cursor-pointer pl-3"
                    onClick={handleDisconnect}
                  >
                    Log out
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          id="connectButton"
          onClick={openConnectModal}
          className="  rounded-lg 
                p-2 align-middle font-serif font-medium tracking-wider text-white
                "
        >
          ✦ CONNECT
        </button>
      )}
    </div>
  );
};

export default ProfileButton;
