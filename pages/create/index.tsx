import React, { useContext, useState } from 'react';
import { createPost, postData } from '@lib/lens/post';

import CreatableSelect from 'react-select/creatable';
import Editor from 'components/Editor';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import Link from 'next/link';
import { NextPage } from 'next';
import { ProfileContext } from 'components';
import { TAGS } from '@lib/lens/tags';
import Toast from '../../components/Toast';
import { createPostGasless } from '@lib/lens/post-gasless';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 2500);
  });

const Create: NextPage = () => {
  const [name, setName] = useState('');

  const [title, setTitle] = useState('');
  const [dispatcherStatus, setDispatcherStatus] = useState<boolean | undefined>(
    undefined
  );

  const router = useRouter();
  const [abstract, setAbstract] = useState('');
  const [editorContents, setEditorContents] = useState('');
  const [link, setLink] = useState('');
  const [cover, setCover] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);

  const [loading, setLoading] = useState(false);
  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
  };

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

  const handleChangeEditor = (content: string) => setEditorContents(content);

  const handlePost = async () => {
    const constructedPost = {
      name: title,
      // title: title,
      abstract: abstract || '',
      content: editorContents || '',
      link: link,
      cover: cover,
      // TODO: GET FILTER ARRAY FROM THE UI
      tags: selectedOption.map((r) => r['label'])
      // todo: image?: Buffer[]
    };

    if (!lensProfile) {
      return;
    }

    setLoading(true);

    try {
      // collect post
      if (!lensProfile) {
        return;
      }

      await (dispatcherStatus
        ? await createPostGasless(lensProfile.id, constructedPost)
        : await createPost(lensProfile.id, constructedPost));

      setIsSuccessVisible(true);

      await sleep();
      router.push('/');
    } catch (e: any) {
      setIsErrorVisible(true);
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Layout title="Lenstags | Create post" pageDescription="Create post">
      <div className="container mx-auto h-64  w-11/12 py-6 px-6 text-black md:w-1/2">
        <div className="text-xl font-semibold">
          <span className="text-left">Create post</span>
          <div
            className="tooltip tooltip-bottom z-10 float-right"
            data-tip="By enabling gasless transactions you will able to sign once and post
          for free!"
          >
            <button
              data-tooltip-target="tooltip-default"
              className={
                dispatcherStatus === undefined
                  ? 'rounded-lg bg-stone-200 px-2 py-2 text-xs'
                  : dispatcherStatus
                  ? 'rounded-lg bg-green-300 px-2 py-1 text-xs'
                  : 'rounded-lg bg-red-300 px-2 py-1  text-xs'
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
        <div className="my-6 rounded-lg bg-lensBlack ">
          <div className="input-translate flex w-full place-items-baseline  justify-between rounded-lg border-2 border-lensBlack bg-white px-6 py-1">
            <div>
              {' '}
              <p className="font-semibold">Title</p>
            </div>
            <div className="w-full">
              <input
                className=" mx-4 w-full bg-white px-3 py-2 font-semibold text-lensBlack outline-none"
                type="text"
                name="title"
                id="title"
                onChange={(e) => {
                  setTitle(e.target.value);
                  return;
                }}
              />
            </div>
          </div>
        </div>

        <div className="z-20 my-6 rounded-lg bg-lensBlack">
          <div className="input-translate flex  w-full place-items-baseline justify-between rounded-lg border-2 border-lensBlack bg-white px-6">
            <div>
              <p className="font-semibold">Tags</p>
            </div>
            <div className="w-full border-0 pl-4 ">
              <CreatableSelect
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: 'none',
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: 'transparent'
                    }
                  })
                }}
                menuPortalTarget={document.querySelector('body')}
                isMulti
                onChange={handleChange}
                options={TAGS}
              />
            </div>
          </div>
        </div>

        <div className="my-6 rounded-lg bg-lensBlack">
          <div className="input-translate flex w-full place-items-baseline justify-between rounded-lg border-2 border-lensBlack bg-white px-6 py-1">
            <div>
              {' '}
              <p className="font-semibold">Link</p>
            </div>
            <div className="w-full">
              <input
                className="  w-full bg-white py-2 px-6 text-lensPurple outline-none"
                type="text"
                name="link"
                id="link"
                placeholder="Insert the link starting with 'https://'"
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="my-6 rounded-lg bg-lensBlack">
          <div className="input-translate flex w-full place-items-baseline justify-between rounded-lg border-2 border-lensBlack bg-white px-6 py-1">
            <div>
              {' '}
              <p className="font-semibold">Abstract</p>
            </div>
            <div className="w-full">
              <input
                className=" mx-4 w-full bg-white px-3 py-2 font-semibold text-lensBlack outline-none"
                type="text"
                name="abstract"
                id="abstract"
                onChange={(e) => setAbstract(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="my-6 rounded-lg bg-lensBlack">
          <div className="input-translate flex w-full place-items-baseline justify-between rounded-lg border-2 border-lensBlack bg-white px-2 py-1">
            <div className="w-full">
              <Editor
                initialContent={initialContent}
                onChange={handleChangeEditor}
              />
            </div>
          </div>

          <div className="flex h-full min-w-fit items-center justify-center  border-black  pl-8">
            <button className="flex align-middle">
              <Link href={'/create'}>
                <div className="button_top flex">
                  <div>
                    <ImageProxied
                      category="profile"
                      className="text-lensBlack"
                      src="/assets/icons/photo.svg"
                      alt="Lenstags Logo"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>Add Cover</div>
                </div>
              </Link>
            </button>
          </div>
        </div>

        <div className="my-6 flex items-center justify-between  rounded-lg">
          <div className="w-full rounded-lg bg-lensBlack  ">
            <div className=" w-12/12 input-translate  flex items-center  rounded-lg border-2 border-lensBlack bg-white py-3 px-6">
              <div>
                <p className="font-semibold">Cover</p>
              </div>
              <div className="px-6 text-sm text-lensGray2 ">
                Upload image (Optional)
              </div>
            </div>
          </div>

          <div className="flex h-full min-w-fit items-center justify-center  border-black  pl-8">
            <button className="flex align-middle">
              <Link href={'/create'}>
                <div className="button_top flex">
                  <div>
                    <ImageProxied
                      category="profile"
                      className="text-lensBlack"
                      src="/assets/icons/photo.svg"
                      alt="Lenstags Logo"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>Add Cover</div>
                </div>
              </Link>
            </button>
          </div>
        </div>

        <div className="text-right">
          {isSuccessVisible && (
            <Toast text="Post created successfully!" level="success" />
          )}
          {isErrorVisible && (
            <Toast text="Something went wrong" level="error" />
          )}

          <div className="pb-6 text-right">
            <div className="flex h-full min-w-fit items-center  justify-end border-black   pl-8 ">
              <button
                disabled={loading}
                onClick={() =>
                  handlePost().then(() => {
                    // useWaitFiveSeconds();
                  })
                }
                className="flex align-middle"
              >
                <div className="button_Nobg flex items-center bg-lensPurple text-lensGray">
                  {loading && (
                    <svg
                      className="ml-2 h-5 w-5 animate-spin"
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
                  <div className="px-4 py-2 text-xl">Create Post</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
