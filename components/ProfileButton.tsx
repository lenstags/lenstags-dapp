import React, { useContext, useState } from 'react';

import Image from 'next/image';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

const ProfileButton = () => {
  const { openConnectModal } = useConnectModal();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
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
    <div id="connectArea" className="bg-white pb-3 text-right ">
      {lensProfile ? (
        <>
          <button
            style={{ height: '40px' }}
            onClick={() => setProfileView(!profileView)}
            className="rounded-lg
                   border border-solid bg-transparent px-3 py-1 align-middle"
          >
            <div className="flex items-center">
              <ImageProxied
                category="profile"
                className="mx-1 h-7 w-7 rounded-full object-cover"
                src={pictureUrl}
                alt="avatar"
                width={40}
                height={40}
              />
              <div className="pl-1">{lensProfile?.name}</div>
            </div>
          </button>

          {/* profile menu */}
          {profileView && (
            <div className="absolute z-20 mt-2 w-full px-4">
              <div className="flex justify-end">
                <div className="  justify-end rounded-lg border border-black bg-white px-4 py-2">
                  <div className="my-3 flex items-center">
                    <ImageProxied
                      category="profile"
                      className="mx-1 h-7 w-7 rounded-full object-cover"
                      src={pictureUrl}
                      alt="avatar"
                      width={40}
                      height={40}
                    />
                    <div className="pl-2">
                      <p className="w-48 truncate text-ellipsis font-serif font-bold">
                        {lensProfile?.ownedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center py-2 pl-1 hover:bg-teal-100">
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

                  <div className="flex items-center py-2 pl-1 hover:bg-teal-100">
                    <Image
                      src="/icons/settings.svg"
                      alt="Settings"
                      width={18}
                      height={18}
                    />

                    <div className="pl-3">
                      <Link href={'/settings'} className="hover:font-bold ">
                        Settings
                      </Link>
                    </div>
                  </div>

                  <div className=" flex items-center py-2 pl-1 hover:bg-teal-100">
                    <Image
                      src="/icons/help.svg"
                      alt="Help"
                      width={18}
                      height={18}
                    />
                    <div className="pl-3">Help</div>
                  </div>

                  <div className=" flex items-center py-2 pl-1 hover:bg-teal-100">
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
