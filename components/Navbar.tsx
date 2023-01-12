/* eslint-disable jsx-a11y/role-supports-aria-props */
import React, { useContext, useEffect, useState } from 'react';
import { useDisconnect } from 'wagmi';
import ImageProxied from './ImageProxied';
import { explore } from '../lib/lens/explore-publications';
import { ProfileContext, TagsFilterContext } from 'components';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import Link from 'next/link';

export const Navbar = () => {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };
  const { tags } = useContext(TagsFilterContext);

  const lensProfile = useContext(ProfileContext);

  useEffect(() => {
    explore({ tags }).then((data) => {
      // TODO Integrate with card listing
      console.log(data);
    });
  }, [tags]);

  return (
    <>
      <div className="w-full h-full bg-gray-100">
        <div className="flex flex-no-wrap">
          {/*Mobile responsive sidebar*/}
          <div
            className={
              show
                ? 'w-full h-full absolute z-40  transform  translate-x-0 '
                : '   w-full h-full absolute z-40  transform -translate-x-full'
            }
            id="mobile-nav"
          >
            <div
              className="bg-gray-800 opacity-50 absolute h-full w-full lg:hidden"
              onClick={() => setShow(!show)}
            />
            <div className="absolute z-40 sm:relative w-64 md:w-96 shadow pb-4 bg-greenLengs lg:hidden transition duration-150 ease-in-out h-full">
              <div className="flex flex-col justify-between h-full w-full">
                <div>
                  <div className="flex items-center justify-between px-8">
                    <div className="h-16 w-full flex items-center">
                      <Link href={'/'}>
                        <ImageProxied
                          category="profile"
                          src="/img/logo-extended.svg"
                          alt="Lenstags Logo"
                          width={100}
                          height={60}
                        />
                      </Link>
                    </div>
                    <div
                      id="closeSideBar"
                      className="flex items-center justify-center h-10 w-10"
                      onClick={() => setShow(!show)}
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
                    <li className="pl-6 cursor-pointer text-black text-sm leading-3 tracking-normal pb-4 pt-5 hover:font-semibold focus:outline-none">
                      <div className="flex items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8">
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
                        <span className="ml-2 xl:text-base md:text-2xl text-base">
                          <Link href={'/organizations'}>Organizations</Link>
                        </span>
                      </div>
                    </li>

                    <li className="pl-6 cursor-pointer text-black text-sm leading-3 tracking-normal mb-4 py-2 hover:font-semibold  focus:outline-none">
                      <div className="flex items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8">
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
                        <span className="ml-2 xl:text-base md:text-2xl text-base">
                          <Link href={'/explore'}>Explore</Link>
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="w-full">
                  <div className="border-t border-black">
                    <div className="w-full flex items-center justify-between px-6 pt-1">
                      <div className="flex items-center  ">
                        <ImageProxied
                          category="post"
                          className=""
                          width="30px"
                          height="30px"
                          src={lensProfile?.pictureUrl || '/img/profilePic.png'}
                          alt="avatar"
                        />
                        <p className="md:text-xl  text-gray-800 text-base leading-4 ml-2">
                          {lensProfile?.name || 'no-name'}
                        </p>
                      </div>
                      <ul className="flex">
                        <li className="cursor-pointer text-white pt-5 pb-3">
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
                        </li>
                        <li className="cursor-pointer text-white pt-5 pb-3 pl-3">
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
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full fixed top-0 z-50">
            <nav
              className="h-16 px-10 flex items-center lg:items-stretch justify-end lg:justify-between
             bg-greenLengs  relative z-10
             animate-in  slide-in-from-top duration-500
             "
            >
              <div className="hidden lg:flex w-full pr-6">
                <Link href={'/'}>
                  <ImageProxied
                    category="profile"
                    src="/img/logo-extended.svg"
                    alt="Lenstags Logo"
                    width={100}
                    height={60}
                  />
                </Link>
                <div className="w-1/2 h-full text-black font-light lg:flex items-center pl-6 pr-24">
                  {/**Here comes the Navbar items */}
                  <div className="mx-2 hover:underline">
                    <Link href={'/explorer'}>EXPLORE</Link>
                  </div>
                  <div className="mx-2 hover:underline">
                    <Link href={'/organizations'}>ORGANIZATIONS</Link>
                  </div>
                </div>
                <div className="w-1/2 hidden lg:flex">
                  <div className="w-full flex items-center pl-8 justify-end">
                    <div className="h-full flex items-center justify-center border-l border-black  px-8">
                      <div className="relative cursor-pointer text-gray-600 hover:text-black">
                        <Link href={'/create'}>+ CREATE</Link>
                      </div>
                    </div>

                    <div className="h-full w-20 flex items-center justify-center border-r border-l border-black">
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
                        <div className="w-2 h-2 rounded-full bg-red-400 border border-white absolute inset-0 mt-1 mr-1 m-auto" />
                      </div>
                    </div>

                    <div className="h-full w-20 flex items-center justify-center border-r border-black mr-4 cursor-pointer hover:text-black text-gray-600">
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
                    </div>
                    <div
                      className="flex items-center relative cursor-pointer"
                      onClick={() => setProfile(!profile)}
                    >
                      <div className="rounded-full">
                        {profile ? (
                          <ul
                            className=" font-extralight -left-16 border-r text-black bg-white absolute rounded shadow"
                            style={{ marginTop: '4.4rem' }}
                          >
                            <li className="px-5 py-3 border-b flex w-full justify-between cursor-pointer ">
                              <div className="fl first-letter:ex">
                                <p className="text-xs">Connected as</p>
                                <p className=" font-normal">
                                  @{lensProfile?.handle}
                                </p>
                              </div>
                            </li>
                            <li className="px-5 py-3 border-b flex w-full justify-between cursor-pointer items-center">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="icon icon-tabler icon-tabler-user"
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
                                <Link href={'/settings'} className="ml-2">
                                  Settings
                                </Link>
                              </div>
                            </li>
                            <li className="px-5 py-3 border-b flex w-full justify-between cursor-pointer items-center">
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
                                  className="ml-2"
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
                        <div className="relative p-0 m-0">
                          <ImageProxied
                            category="profile"
                            height={70}
                            width={70}
                            objectFit="cover"
                            src={
                              lensProfile?.pictureUrl || '/img/profilePic.png'
                            }
                            alt="avatar"
                          />
                        </div>
                      </div>

                      <div className="cursor-pointer text-gray-600">
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
              </div>
              <div
                className="text-gray-600  visible lg:hidden relative"
                onClick={() => setShow(!show)}
              >
                <div className="flex justify-between w-screen items-center">
                  <div className="ml-20">
                    {' '}
                    <ImageProxied
                      category="profile"
                      src="/img/logo-extended.svg"
                      alt="Lenstags Logo"
                      width={100}
                      height={60}
                    />
                  </div>
                  <div className="mr-3">
                    {show ? (
                      ' '
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
                    )}{' '}
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
