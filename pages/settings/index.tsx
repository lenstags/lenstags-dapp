import { Layout } from "components";
import { ProfileContext } from "components";
import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";

const Settings: NextPage = () => {
  const lensProfile = useContext(ProfileContext);

  return (
    <Layout title="Lenstags | Settings" pageDescription="Settings">
      <div className="container mx-auto py-10 h-64 md:w-1/2 w-11/12 px-6 text-black">
        <h1 className=" text-2xl">Settings</h1>

        <p className="px-6 py-4">Dispatcher</p>
        <div
          style={{ borderWidth: "0.5px", borderColor: "#949494" }}
          className="shadow-md rounded-md font-extralight"
        >
          <p className="px-6 py-4">
            Set the dispatcher function to active
            <label className="inline-flex relative items-center cursor-pointer ml-4">
              <input type="checkbox" value="" className="sr-only peer" />
              <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
             rounded-full peer
              peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px]
               after:bg-white
               after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
               peer-checked:bg-greenLengs"
              ></div>
            </label>
          </p>
        </div>

        <p className="px-6 py-4">Profile</p>
        <div
          style={{ borderWidth: "0.5px", borderColor: "#949494" }}
          className="shadow-md rounded-md font-extralight"
        >
          {/* TODO: row, COMPONENTIZE THIS!*/}
          <div className="px-6 py-4">
            <span className="">Profile Id</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
              value={lensProfile?.id || "no-name"}
            />
            <span className="">Name</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="name"
              id="name"
              value={lensProfile?.name || "no-name"}
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Location</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
            />
            <span className="">Website</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Twitter</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Style</span>
            <Image
              className="ml-6 rounded-full"
              src={lensProfile?.pictureUrl || "/img/logo-extended.svg"}
              alt="User profile picture"
              width={70}
              height={70}
              objectFit="cover"
            />
          </div>
        </div>

        <p className="px-6 py-4">Account</p>
        <div
          style={{ borderWidth: "0.5px", borderColor: "#949494" }}
          className="shadow-md rounded-md font-extralight"
        >
          <p className="px-6 py-4">Further account options</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
