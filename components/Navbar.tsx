/* eslint-disable jsx-a11y/role-supports-aria-props */

import React, { useContext, useEffect, useState } from 'react';
import {
  deleteLensLocalStorage,
  getFromLocalStorage
} from 'lib/lens/localStorage';

import { AppContext } from 'context/AppContext';
import ImageProxied from './ImageProxied';
import Link from 'next/link';
import { MediaSet } from '@lib/lens/graphql/generated';
import { ProfileContext } from './LensAuthenticationProvider';
import { TagsFilterContext } from './TagsFilterProvider';
import { explore } from '../lib/lens/explore-publications';
import { getLastComment } from '@lib/lens/get-publications';
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
  const [profileView, setProfileView] = useState(false);
  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  const { tags } = useContext(TagsFilterContext);
  const lensProfile = useContext(ProfileContext);
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

  const router = useRouter();

  /// TODO: check this
  useEffect(() => {
    explore({ tags }).then((data) => {
      // TODO Integrate with card listing
      // console.log(' de lensProfile: ', lensProfile);
      console.log(
        'EXPLORER-DATA 🏄🏽‍♂️🏄🏽‍♂️🏄🏽‍♂️',
        data.items[0],
        ' of: ',
        data.items.length
      );
      // console.log('tags ', tags);
    });
  }, [tags, lensProfile]);

  // const mediaSet = getFromLocalStorage()?.profile?.picture as MediaSet;
  // const [storePic, setStorePic] = useState(mediaSet.original.url || '');
  // useEffect(() => {
  //   const media = getFromLocalStorage()?.profile?.picture as MediaSet;
  //   const storedMedia = media.original.url;
  //   if (storedMedia !== storePic) {
  //     setStorePic(storedMedia);
  //   }
  // }, [storePic]);

  return (
    <>
      <div className="h-full w-full">
        <div className="flex-no-wrap flex">
          {/* Mobile responsive sidebar */}
          <div
            className={
              showMobileNav
                ? 'absolute z-40 h-full w-full  translate-x-0  transform '
                : '   absolute z-40 h-full w-full  -translate-x-full transform'
            }
            id="mobile-nav"
          >
            <div
              className="absolute h-full w-full bg-gray-800 opacity-50 lg:hidden"
              onClick={() => setShowMobileNav(!showMobileNav)}
            />
            <div className="absolute z-40 h-full w-64 bg-lensGreen pb-4 shadow  transition duration-150 ease-in-out sm:relative md:w-96 lg:hidden">
              <div className="flex h-full w-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between px-8">
                    <div className="flex h-16 w-full items-center">
                      <Link href={'/'}>
                        <ImageProxied
                          category="profile"
                          src="/img/logo-extended.svg"
                          alt=""
                          width={100}
                          height={60}
                        />
                      </Link>
                    </div>
                    <div
                      id="closeSideBar"
                      className="flex h-10 w-10 items-center justify-center"
                      onClick={() => setShowMobileNav(!showMobileNav)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-x"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="black"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <line x1={18} y1={6} x2={6} y2={18} />
                        <line x1={6} y1={6} x2={18} y2={18} />
                      </svg>
                    </div>
                  </div>
                  <ul aria-orientation="vertical" className=" py-6">
                    <li className="text-gray cursor-pointer pb-4 pl-6 pt-5 text-sm leading-3 tracking-normal hover:font-semibold focus:outline-none">
                      <div className="flex items-center">
                        <div className="h-6 w-6 md:h-8 md:w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-grid"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <rect x={4} y={4} width={6} height={6} rx={1} />
                            <rect x={14} y={4} width={6} height={6} rx={1} />
                            <rect x={4} y={14} width={6} height={6} rx={1} />
                            <rect x={14} y={14} width={6} height={6} rx={1} />
                          </svg>
                        </div>
                        <span className="ml-2 text-base md:text-2xl xl:text-base">
                          <Link href={'#'}>Projects</Link>
                        </span>
                      </div>
                    </li>

                    <li className="mb-4 cursor-pointer py-2 pl-6 text-sm leading-3 tracking-normal text-black hover:font-semibold  focus:outline-none">
                      <div className="flex items-center">
                        <div className="h-6 w-6 md:h-8 md:w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-compass"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <polyline points="8 16 10 10 16 8 14 14 8 16" />
                            <circle cx={12} cy={12} r={9} />
                          </svg>
                        </div>
                        <span className="ml-2 text-base md:text-2xl xl:text-base">
                          <Link href={'/app'}>Explore</Link>
                        </span>
                      </div>
                    </li>

                    <li className="mb-4 cursor-pointer py-2 pl-6 text-sm leading-3 tracking-normal text-black hover:font-semibold  focus:outline-none">
                      <div className="flex items-center">
                        <div className="h-6 w-6 md:h-8 md:w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-compass"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <polyline points="8 16 10 10 16 8 14 14 8 16" />
                            <circle cx={12} cy={12} r={9} />
                          </svg>
                        </div>
                        {/* <span className="ml-2 text-base md:text-2xl xl:text-base">
                          <Link href={'/lists'}>My lists</Link>
                        </span> */}
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="w-full">
                  <div className="border-t border-black">
                    <div className="flex w-full items-center justify-between px-6 pt-1">
                      <div className="flex items-center">
                        {/* Lists:
                        {console.log(
                          lensProfile?.attributes as AttributeData[]
                        )} */}
                        <ImageProxied
                          category="post"
                          className=""
                          width="30px"
                          height="30px"
                          src={pictureUrl}
                          // src={lensProfile?.pictureUrl || '/img/profilePic.png'}
                          alt="avatar"
                        />
                        <p className="ml-2  text-base leading-4 text-gray-800 md:text-xl">
                          {lensProfile?.name || 'no-name'}
                        </p>
                      </div>
                      <ul className="flex">
                        {/* <li className="cursor-pointer pb-3 pt-5 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-messages"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="#718096"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                            <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                          </svg>
                        </li> */}
                        {/* <li className="cursor-pointer pb-3 pl-3 pt-5 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-bell"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="#718096"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                          </svg>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="fixed top-0 z-50 w-full border-b-2 border-black">
            <nav
              className={`relative z-10 flex h-16 items-center justify-end bg-lensGreen
              px-10  text-sm lg:items-stretch lg:justify-between
              ${config.firstRun && ' '}  
              `}
            >
              <div className="hidden w-full pr-6 lg:flex">
                <Link href={'/'}>
                  <ImageProxied
                    category="profile"
                    src="/img/logo-extended.svg"
                    alt=""
                    width={100}
                    height={60}
                  />
                </Link>

                <div className="h-full w-1/2 items-center pl-6 pr-24 text-black lg:flex">
                  {/* Here comes the Navbar items */}
                  <div
                    className={`mx-4 cursor-pointer rounded-md p-2  px-3 ${
                      router.asPath === '/app' && ' bg-gray-700 text-lensGray'
                    } hover:bg-lensBlack hover:text-lensGray `}
                  >
                    <Link href={'/app'}>EXPLORE</Link>
                  </div>

                  <div className=" mx-2 p-2 text-gray-400">
                    <Link href={'#'}>
                      <p className="cursor-default" title="Soon">
                        PROJECTS
                      </p>
                    </Link>
                  </div>

                  {/* <div>
                    <label htmlFor="darkmode-toggle">Dark Mode</label>
                    <input
                      type="checkbox"
                      id="darkmode-toggle"
                      checked={config.isDarkMode}
                      onChange={toggleDarkMode}
                    />
                  </div>

                  <div
                    className={config.isDarkMode ? 'bg-red-200' : 'bg-blue-200'}
                  >
                    Enabled
                  </div> */}

                  {/* <button
                    onClick={() => {
                      if (config.firstRun) {
                        updateConfig({ firstRun: false });
                        const lensStore = getFromLocalStorage();
                        lensStore?.firstRun = false;
                      }
                    }}
                  >
                    Got it!
                  </button> */}

                  {/* <div
                    className={`mx-2  p-2 ${
                      router.asPath === '/lists#' &&
                      'bg-lensBlack text-lensGray'
                    } hover:bg-lensBlack hover:text-lensGray`}
                  >
                    <Link href={'/lists'}>
                      <a>MY LISTS</a>
                    </Link>
                  </div> */}
                  {/* 
                  <div
                    className={`mx-2 p-2 ${
                      router.asPath === '/lists#' &&
                      'bg-lensBlack text-lensGray'
                    } hover:bg-lensBlack hover:text-lensGray`}
                  >
                    <Link href={'/my-creations'}>
                      <a>MY CREATIONS</a>
                    </Link>
                  </div> */}
                  {/* 
                  <div className="flex items-center">
                    <div className="h-6 w-6 md:h-8 md:w-8">
                      <button
                        className="bg-white text-black"
                        onClick={asyncFunc}
                      >
                        test
                      </button>
                    </div>
                  </div> */}
                </div>
                {/* connect area */}
                {lensProfile ? (
                  <div className="hidden w-1/2 lg:flex">
                    <div className="flex w-full items-center justify-end pl-8">
                      <div className="flex h-full items-center justify-center  border-black  px-8">
                        <button className="flex align-middle">
                          <Link href={'/create'}>
                            <div className="button_top flex">
                              <div>
                                <ImageProxied
                                  category="profile"
                                  className="text-lensBlack"
                                  src="/assets/icons/plus.svg"
                                  alt=""
                                  width={20}
                                  height={20}
                                />
                              </div>
                              <div>CREATE</div>
                            </div>
                          </Link>
                        </button>
                      </div>

                      {/* <div className="flex h-full w-20 items-center justify-center  border-black">
                        <div className="relative cursor-pointer text-gray-600 hover:text-black">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-bell"
                            width={28}
                            height={28}
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                          </svg>
                          <div className="absolute inset-0 m-auto mr-1 mt-1 h-2 w-2 animate-ping rounded-full border border-white bg-red-600" />
                        </div>
                      </div> */}

                      {/* <div className="mr-4 flex h-full w-20 cursor-pointer  items-center justify-center border-black text-gray-600 hover:text-black">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-messages"
                          width={28}
                          height={28}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                          <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                        </svg>
                      </div> */}
                      <div
                        className="relative flex cursor-pointer items-center "
                        onClick={() => setProfileView(!profileView)}
                      >
                        <div className="items-center rounded-full">
                          {profileView ? (
                            <ul
                              className=" absolute -left-16 rounded border-r bg-white font-extralight text-black shadow"
                              style={{
                                marginTop: '4.4rem',
                                marginLeft: '-4rem'
                              }}
                            >
                              <li className="flex w-full cursor-pointer justify-between border-b px-5 py-3 ">
                                <div className="fl first-letter:ex">
                                  <Link
                                    href={'/my-profile'}
                                    className="ml-2 hover:font-bold "
                                  >
                                    <p>
                                      <p className="text-xs font-thin text-gray-400">
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
                                      fill-rule="evenodd"
                                      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                                      clip-rule="evenodd"
                                    />
                                  </svg>

                                  <Link
                                    href={'/settings'}
                                    className=" hover:font-bold "
                                  >
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
                                    // FIXME should clear whole profile and token everywhere like in clearProfile()
                                    onClick={handleDisconnect}
                                  >
                                    Disconnect
                                  </span>
                                </div>
                              </li>
                            </ul>
                          ) : (
                            ''
                          )}
                          <div className="relative">
                            <div className="flex items-center">
                              <ImageProxied
                                className="rounded-full"
                                category="profile"
                                height={50}
                                width={50}
                                objectFit="cover"
                                src={pictureUrl}
                                alt="avatar"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="cursor-pointer text-lensGray2 ease-linear visited:rotate-180 focus:rotate-0 active:rotate-0 ">
                          <svg
                            aria-haspopup="true"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-chevron-down"
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
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden w-1/2 justify-end lg:flex">
                    <div className="flex h-full items-center justify-center  border-black">
                      <button
                        onClick={openConnectModal}
                        className="flex align-middle"
                      >
                        <div className="button_top flex">
                          <div>✦ CONNECT</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div
                className=" visible   relative text-lensBlack lg:hidden"
                onClick={() => setShowMobileNav(!showMobileNav)}
              >
                <div className="flex w-screen items-center justify-between">
                  <div className="ml-20">
                    {' '}
                    <ImageProxied
                      category="profile"
                      src="/img/logo-extended.svg"
                      alt=""
                      width={100}
                      height={60}
                    />
                  </div>
                  <div className="mr-3">
                    {showMobileNav ? (
                      <ImageProxied
                        category="profile"
                        src="/assets/icons/x.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    ) : (
                      <svg
                        aria-label="Main Menu"
                        aria-haspopup="true"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-menu cursor-pointer"
                        width={30}
                        height={30}
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <line x1={4} y1={8} x2={20} y2={8} />
                        <line x1={4} y1={16} x2={20} y2={16} />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};
