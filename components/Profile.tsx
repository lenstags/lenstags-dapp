/* eslint-disable @next/next/no-img-element */

import { profileMockData } from "../__mocks__/profileMockData";

import React, { useContext, useEffect, useState } from "react";

import { ProfileContext } from "components/LensAuthenticationProvider";

export const Profile = () => {
  const lensProfile = useContext(ProfileContext);
  console.log(lensProfile);

  return (
    <div className="mb-5">
      <div className="bg-greenLengs py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 shadow rounded-t">
        <div className="flex items-center  sm:mb-0 md:mb-0 lg:mb-0 xl:mb-0">
          <div className="relative w-24 h-24 ">
            <img
              className=" rounded-full"
              width="100%"
              height="100%"
              src={lensProfile?.pictureUrl || profileMockData.profilePic}
              alt="avatar"
            />
          </div>
          <div className="ml-2">
            <h2 className="text-black text-2xl font-semibold">
              {lensProfile?.name}
            </h2>
            <span className=" text-slate-400 font-mono ">
              @{lensProfile?.handle}
            </span>
            <p className="font-normal text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-700">
              Edit Profile
            </p>
          </div>
        </div>

        <div>
          <div className="flex">
            <div>
              <div className="flex ml-2 sm:ml-3 font-normal focus:outline-none  hover:font-bold transition duration-150 ease-in-out border border-black hover:border-2 rounded-none text-black px-6 py-2 text-sm">
                <div>
                  <svg
                    className="h-5 w-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>

                <div>
                  <button className="pl-2">Mensagge</button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex ml-2 sm:ml-3 font-normal focus:outline-none  hover:font-bold transition duration-150 ease-in-out border border-black hover:border-2 rounded-none text-black px-6 py-2 text-sm">
                <div>
                  <svg
                    className="h-5 w-5 text-black"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <rect x="4" y="4" width="16" height="16" rx="2" />{" "}
                    <line x1="9" y1="12" x2="15" y2="12" />{" "}
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
