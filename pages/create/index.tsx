import { Layout } from "components";
import { ProfileContext } from "components";
import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Editor from "components/Editor";

const Create: NextPage = () => {
  const lensProfile = useContext(ProfileContext);

  return (
    <Layout title="Lenstags | Settings" pageDescription="Settings">
      <div className="container mx-auto py-10 h-64 md:w-1/2 w-11/12 px-6 text-black">
        <p className="text-xl font-semibold">New post</p>

        <div className="px-6 py-1 my-4 flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <p className=" ">TITLE</p>
          <input
            className=" text-sm w-full px-3 py-2 mx-4 text-gray-600 bg-white outline-none"
            type="text"
            name="profileId"
            id="profileId"
          />
        </div>

        <p className="ml-6 mb-2">Post details</p>

        <div className="px-6 py-1  flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <p className=" ">ABSTRACT</p>
          <input
            className=" text-sm w-full px-3 py-2 mx-4 text-gray-600 bg-white outline-none"
            type="text"
            name="profileId"
            id="profileId"
          />
        </div>

        <div className="mb-4 border border-gray-100 shadow-md rounded-md font-extralight">
          <Editor />
        </div>

        <p className="ml-6 mb-2">Links</p>

        <div className="px-6 py-1 my-4 flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <input
            className=" text-sm w-full py-2 text-gray-600 bg-white outline-none"
            type="text"
            name="profileId"
            id="profileId"
            placeholder="Insert the link starting with 'https://'"
          />
        </div>

        <p className="ml-6 mb-2">Cover</p>
        <button className="bg-gray-100 my-2 mb-4 px-4 py-2 rounded-md shadow-md">
          Add photo
        </button>

        <p className="ml-6 mb-2">Tags</p>
        <div className="px-6 py-1 my-4 mb-6 flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <div className=" text-sm w-full py-2 text-gray-600 bg-white outline-none" />
        </div>

        <div className="text-right">
          <button className="font-light bg-greenLenstags my-2 mb-4 px-6 py-4 rounded-md shadow-md">
            CREATE POST
          </button>
        </div>
        <br />
      </div>
    </Layout>
  );
};

export default Create;
