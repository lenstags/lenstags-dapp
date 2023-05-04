import React, { useContext, useEffect, useState } from 'react';

import ImageProxied from './ImageProxied';
import { ProfileContext } from './LensAuthenticationProvider';

/* eslint-disable @next/next/no-img-element */
// import { ProfileContext } from 'components/LensAuthenticationProvider';

export const Profile = () => {
  // const lensProfile = useContext(ProfileContext);
  const { profile: lensProfile } = useContext(ProfileContext);

  console.log('lensProfile de perfil:::: ', lensProfile);
  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';
  return (
    <div className="mb-5">
      <div className="bg-greenLengs flex flex-col items-start justify-between rounded-t px-5 py-4 shadow sm:flex-row sm:items-center">
        <div className="flex items-center  sm:mb-0 md:mb-0 lg:mb-0 xl:mb-0">
          <div className="relative h-24 w-24 ">
            <ImageProxied
              category="profile"
              className=" rounded-full"
              width="100%"
              height="100%"
              src={pictureUrl}
              alt="avatar"
            />
          </div>
          <div className="ml-2">
            <h2 className="text-2xl font-semibold text-black">
              {lensProfile?.name}
            </h2>
            <span className=" font-mono text-slate-400 ">
              @{lensProfile?.handle}
            </span>
            <p className="cursor-pointer text-xs font-normal text-gray-600 hover:text-gray-700 dark:text-gray-400">
              Edit Profile
            </p>
          </div>
        </div>

        <div>
          <div className="flex">
            <div>
              <div className="ml-2 flex rounded-none border border-black  px-6 py-2 text-sm font-normal text-black transition duration-150 ease-in-out hover:border-2 hover:font-bold focus:outline-none sm:ml-3">
                <div>
                  <svg
                    className="h-5 w-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>

                <div>
                  <button className="pl-2">Mensagggge</button>
                </div>
              </div>
            </div>

            <div>
              <div className="ml-2 flex rounded-none border border-black  px-6 py-2 text-sm font-normal text-black transition duration-150 ease-in-out hover:border-2 hover:font-bold focus:outline-none sm:ml-3">
                <div>
                  <svg
                    className="h-5 w-5 text-black"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {' '}
                    <path stroke="none" d="M0 0h24v24H0z" />{' '}
                    <rect x="4" y="4" width="16" height="16" rx="2" />{' '}
                    <line x1="9" y1="12" x2="15" y2="12" />{' '}
                    <line x1="12" y1="9" x2="12" y2="15" />
                  </svg>
                </div>

                <div>
                  <button className="pl-2">Follow</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
