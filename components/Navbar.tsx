/* eslint-disable jsx-a11y/role-supports-aria-props */

import React, { useContext, useEffect, useState } from 'react';

import { AppContext } from 'context/AppContext';
import Image from 'next/image';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { PublicRoutes } from '@models/routes.model';
import { TagsFilter } from './TagsFilter';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';

export const Navbar = () => {
  // const asyncFunc = async () => {
  //   const p = await getLastComment('0x4b87-0x0178');
  //   console.log('PUBLICATION3 with new comments: ', p);
  // };
  const { openConnectModal } = useConnectModal();
  const { config, updateConfig } = useContext(AppContext);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { authenticationStatus } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
  const router = useRouter();

  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
    router.push(PublicRoutes.APP);
  };

  // const { tags } = useContext(TagsFilterContext);
  const { profile: lensProfile } = useContext(ProfileContext);

  // TODO: TEST THIS FOR NFT URI
  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  const toggleDarkMode = () => {
    updateConfig({ isDarkMode: !config.isDarkMode });
  };

  return (
    <div className="fixed top-0 z-50 flex w-full ">
      {/* Desktop navbar */}
      {/* TODO */}
      {/* ${config.firstRun && ' '}   */}

      {/* <div
        className="lg:item 
      s-stretch lg:justi
      fy-between rel ative fl ex
      items-center border-2 border-solid border-red-500 p-6"
      > */}

      {/* logo & nav col */}
      <div className="flex w-2/12 items-center justify-start  bg-stone-100 p-6">
        <Link href={'/'}>
          <Image
            className="  "
            // category="profile"
            src="/img/landing/nata-logo.svg"
            alt=""
            width={150}
            height={40}
          />
        </Link>
      </div>

      {/* middle search bar */}
      <div className="flex w-7/12 bg-white p-6">
        <input
          type="text"
          style={{ height: '40px' }}
          autoComplete="off"
          // value={valueListName}
          // onChange={handleChangeListName}
          className="  w-full rounded-lg border border-stone-500 
          bg-stone-100  px-3 py-1 
                      leading-none  outline-none"
          name="tag-search-input"
          id="tag-search-input"
          // onKeyDown={handleKeyDown}
          placeholder="🔍 Search..."
        />
        <button
          style={{ height: '40px' }}
          className="ml-3 rounded-lg  border border-solid border-stone-500 bg-stone-100 p-3  "
        >
          <svg
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 3L19 3M1 3L10 3M1 15L10 15M1 9H6M10 9H19M14 15H19M14 1V5M6 7V11M14 13V17"
              stroke="#4D4D4D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {/* connect area */}
      <div className="w-3/12 bg-white p-6 text-right ">
        {lensProfile ? (
          <>
            <button
              style={{ height: '40px' }}
              onClick={() => setProfileView(!profileView)}
              className="rounded-lg border border-solid border-stone-500 bg-transparent p-1 align-middle"
            >
              <div className="flex items-center">
                <img
                  className="mx-1 h-7 w-7 rounded-full"
                  src={pictureUrl}
                  alt="avatar"
                />
                <div>@{lensProfile?.handle}</div>
              </div>
            </button>

            {/* menu */}
            {profileView && (
              <ul className=" absolute rounded border-r bg-white font-extralight text-black shadow">
                <li className="flex w-full cursor-pointer justify-between border-b px-5 py-3 ">
                  <div className="fl first-letter:ex">
                    <Link
                      href={'/my-profile'}
                      className="ml-2 hover:font-bold "
                    >
                      <p>
                        <p className="text-xs font-thin text-stone-400">
                          Connected as
                        </p>
                        <span className=" text-green-500">@</span>
                        <span className=" text-green-700">
                          {lensProfile?.handle}
                        </span>
                      </p>
                    </Link>
                  </div>
                </li>
                <li className="items-left flex w-full cursor-pointer border-b px-5 py-3">
                  <div className="float-left flex items-center text-left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-user mr-2 hover:text-red-600"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <circle cx={12} cy={7} r={4} />
                      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <Link
                      href={'/my-profile'}
                      className="ml-2 hover:font-bold "
                    >
                      My profile
                    </Link>
                  </div>
                </li>
                <li className="items-left flex w-full cursor-pointer border-b px-5 py-3">
                  <div className="float-left flex items-center text-left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-1 h-6 w-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <Link href={'/settings'} className=" hover:font-bold ">
                      Settings
                    </Link>
                  </div>
                </li>
                <li className="flex w-full cursor-pointer items-center justify-between border-b px-5 py-3 hover:text-red-600">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-logout"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                      <path d="M7 12h14l-3 -3m0 6l3 -3" />
                    </svg>
                    <span
                      className="ml-2 hover:text-red-600"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </span>
                  </div>
                </li>
              </ul>
            )}
          </>
        ) : (
          <button
            onClick={openConnectModal}
            className="
          rounded-lg p-2 align-middle font-serif font-medium tracking-wider text-white
          "
          >
            ✦ CONNECT
          </button>
        )}
      </div>
    </div>
    // </div>
  );
};
