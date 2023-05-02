import React, { FC, useEffect, useState } from 'react';

import Head from 'next/head';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { UnauthorizedScreen } from 'components';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

interface Props {
  title: string;
  pageDescription: string;
  children: React.ReactNode;
  screen?: boolean;
}

export const LayoutLanding: FC<Props> = ({
  children,
  title,
  pageDescription,
  screen
}) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta name="og:title" content={pageDescription} />
      </Head>

      <nav>
        <div className="h-full w-full bg-black">
          <div className="flex-no-wrap flex">
            {/*Mobile responsive sidebar*/}
            <div
              className={
                show
                  ? 'absolute z-40 h-full w-full  translate-x-0  transform '
                  : '   absolute z-40 h-full w-full  -translate-x-full transform'
              }
              id="mobile-nav"
            >
              <div
                className="absolute h-full w-full bg-gray-800 opacity-50 lg:hidden"
                onClick={() => setShow(!show)}
              />
              <div className="absolute z-40 h-full w-64 bg-lensGreen pb-4 shadow transition duration-150 ease-in-out sm:relative md:w-96 lg:hidden">
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
                      <li className="cursor-pointer pb-4 pl-6 pt-5 text-sm leading-3 tracking-normal text-black hover:font-semibold focus:outline-none">
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
                    </ul>
                  </div>
                  <div className="w-full">
                    <div className="border-t border-black">
                      <div className="flex w-full items-center justify-between px-6 pt-1">
                        <div className="flex items-center  "></div>
                        <ul className="flex">
                          <li className="cursor-pointer pb-3 pt-5 text-white">
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
                          <li className="cursor-pointer pb-3 pl-3 pt-5 text-white">
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

            <div className="fixed top-0 z-50 w-full border-b-2 border-black">
              <nav
                className="relative z-10 flex h-16 items-center justify-end bg-lensGreen
              px-10  animate-in slide-in-from-top
              duration-500  lg:items-stretch lg:justify-between
              "
              >
                <div className="hidden  w-full pr-6 lg:flex">
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
                    {/**Here comes the Navbar items */}
                    <div className="mx-2 p-2  text-black">
                      <Link href={'/app'}>About</Link>
                    </div>

                    <div className="mx-2 p-2  text-black">
                      <Link href={'/app'}>Products</Link>
                    </div>

                    <div className="mx-2 p-2  text-black">
                      <Link href={'/app'}>Docs</Link>
                    </div>

                    <div className="mx-2 p-2  text-black">
                      <Link href={'/app'}>Contact</Link>
                    </div>
                  </div>
                  <div className="hidden w-1/2 lg:flex">
                    <div className="flex w-full items-center justify-end pl-8">
                      <div className="flex h-full items-center justify-center  border-black  px-8">
                        <button className="flex align-middle">
                          <Link href={'/app'}>
                            <div className="button_top flex">
                              <div>Open app</div>
                            </div>
                          </Link>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className=" visible   relative text-lensBlack lg:hidden"
                  onClick={() => setShow(!show)}
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
                      {show ? (
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
                      {''}
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </nav>
      <main className={`${!screen ? 'h-screen' : 'h-full'} mt-16 bg-black`}>
        {children}
      </main>
    </>
  );
};
