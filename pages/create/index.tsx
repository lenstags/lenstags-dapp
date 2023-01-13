import { Layout } from 'components';
import { ProfileContext } from 'components';
import { NextPage } from 'next';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import Editor from 'components/Editor';
import { createPost, postData } from '@lib/lens/post';
import { createPostGasless } from '@lib/lens/post-gasless';
import { queryProfile } from '@lib/lens/dispatcher';

const Create: NextPage = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [dispatcherStatus, setDispatcherStatus] = useState<boolean | undefined>(
    undefined
  );

  const [abstract, setAbstract] = useState('');
  const [editorContents, setEditorContents] = useState('');
  const [link, setLink] = useState('');
  const [cover, setCover] = useState('');
  const [tags, setTags] = useState([]);
  // const [post, setPost] = useState<postData | null>(null);
  const [loading, setLoading] = useState(false);

  const lensProfile = useContext(ProfileContext);
  if (!lensProfile) {
    return null;
  }

  queryProfile({ profileId: lensProfile.id }).then((profile) => {
    setDispatcherStatus(
      profile?.dispatcher?.canUseRelay ? profile.dispatcher.canUseRelay : false
    );

    return;
  });

  const initialContent = 'Write something nice and styled!';

  const handleChangeEditor = (content: string) => {
    setEditorContents(content);
    console.log('Content>>> ', content);
  };

  const handlePost = async () => {
    console.log({ title, abstract, editorContents, link });

    const constructedPost = {
      name: name,
      title: title,
      abstract: abstract,
      content: editorContents || '',
      link: link,
      cover: cover,
      tags: ['web3', 'arts', 'cars']
      // todo: image?: Buffer[]
    };

    console.log('Post! ', constructedPost);
    setLoading(true);
    try {
      // collect post
      if (!lensProfile) {
        return;
      }

      const pubId = dispatcherStatus
        ? await createPostGasless(lensProfile.id, constructedPost)
        : await createPost(lensProfile.id, constructedPost);

      console.log('pubId', pubId);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Layout title="Lenstags | Create post" pageDescription="Create post">
      <div className="container mx-auto py-10 h-64 md:w-1/2 w-11/12 px-6 text-black">
        <div className="text-xl font-semibold">
          <span className="text-left">Create post</span>
          <div
            className="tooltip tooltip-bottom float-right"
            data-tip="By enabling gasless transactions you will able to sign once and post
          for free!"
          >
            <button
              data-tooltip-target="tooltip-default"
              className={
                dispatcherStatus === undefined
                  ? 'bg-stone-200 rounded-lg px-2 py-2 text-xs'
                  : dispatcherStatus
                  ? 'bg-green-300 rounded-lg px-2 py-1 text-xs'
                  : 'bg-red-300 rounded-lg px-2 py-1  text-xs'
              }
            >
              Gasless tx are{' '}
              {dispatcherStatus === undefined
                ? 'loading...'
                : dispatcherStatus
                ? 'Enabled'
                : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="px-6 py-1 my-4 flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <p className=" ">TITLE</p>
          <input
            className=" text-sm w-full px-3 py-2 mx-4 text-gray-600 bg-white outline-none"
            type="text"
            name="title"
            id="title"
            onChange={(e) => {
              setTitle(e.target.value);
              return;
            }}
          />
        </div>

        {/* name: post?.name,
title: post?.title,
abstract: post?.abstract,
content: post?.content,
link: post?.link,
cover: post?.cover,
tags: post?.tags, */}

        <p className="ml-6 mb-2">Post details</p>

        <div className="px-6 py-1  flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <p className=" ">ABSTRACT</p>
          <input
            className=" text-sm w-full px-3 py-2 mx-4 text-gray-600 bg-white outline-none"
            type="text"
            name="abstract"
            id="abstract"
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>

        <div className="mb-4 border border-gray-100 shadow-md rounded-md font-extralight">
          <Editor
            initialContent={initialContent}
            onChange={handleChangeEditor}
          />
        </div>

        <p className="ml-6 mb-2">Link</p>

        <div className="px-6 py-1 my-4 flex place-items-baseline border rounded border-gray-300 shadow-md ">
          <input
            className=" text-sm w-full py-2 text-gray-600 bg-white outline-none"
            type="text"
            name="link"
            id="link"
            placeholder="Insert the link starting with 'https://'"
            onChange={(e) => setLink(e.target.value)}
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
          <button
            onClick={handlePost}
            className="font-light bg-greenLenstags my-2 mb-4 px-12 py-4 rounded-md shadow-md"
          >
            CREATE POST
            {loading && (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
