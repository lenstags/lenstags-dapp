import { Layout } from 'components';
import { ProfileContext } from 'components';
import { NextPage } from 'next';
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Editor from 'components/Editor';
import TagsSelector from 'components/TagsSelector';
import { createPost, postData } from '@lib/lens/post';
import { createPostGasless } from '@lib/lens/post-gasless';
import { queryProfile } from '@lib/lens/dispatcher';
import Toast from '../../components/Toast';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import { TAGS } from '@lib/lens/tags';

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
  const [isPosting, setIsPosting] = useState(false);

  // const [selectedOption, setSelectedOption] = useState(options[0]);

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedValue, setSelectedValue] = useState('');

  const handleSelect = (value: string) => {
    setSelectedValue(value);
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

  const handleChangeEditor = (content: string) => {
    setEditorContents(content);
    console.log('Content>>> ', content);
  };

  const handlePost = async () => {
    const constructedPost = {
      name: name,
      title: title,
      abstract: abstract,
      content: editorContents || '',
      link: link,
      cover: cover,
      // TODO: GET FILTER ARRAY FROM THE UI
      tags: [selectedValue]
      // todo: image?: Buffer[]
    };

    if (!lensProfile) {
      return;
    }

    setLoading(true);

    // const postPromise = dispatcherStatus
    //   ? createPostGasless(lensProfile.id, constructedPost)
    //   : createPost(lensProfile.id, constructedPost);

    // return postPromise
    //   .then((pubId) => {
    //     console.log('🇵🇹 ', pubId);
    //     setIsSuccessVisible(true);
    //     sleep();
    //     router.push('/');
    //   })
    //   .catch((err) => {
    //     setIsErrorVisible(true);
    //     console.error(err);
    //     setLoading(false);
    //   });

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
      <div className="container mx-auto py-6  h-64 md:w-1/2 w-11/12 px-6 text-black">
        <div className="text-xl font-semibold">
          <span className="text-left">Create post</span>
          <div
            className="tooltip z-10 tooltip-bottom float-right"
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
        <div className="bg-lensBlack rounded-lg my-6 ">
          <div className="px-6 w-full py-1 flex  justify-between place-items-baseline bg-white border-2 rounded-lg border-lensBlack input-translate">
            <div>
              {' '}
              <p className="font-semibold">Title</p>
            </div>
            <div className="w-full">
              <input
                className=" w-full font-semibold px-3 py-2 mx-4 text-lensBlack bg-white outline-none"
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

        <div className="bg-lensBlack rounded-lg my-6">
          <div className="px-6 w-full  flex justify-between place-items-baseline bg-white border-2 rounded-lg border-lensBlack input-translate">
            <div>
              <p className="font-semibold">Tags</p>
            </div>
            <div className="w-full">
              <TagsSelector options={TAGS} onSelect={handleSelect} />

              {/* <select className="select px-6 bg-white w-full focus:outline-none">
                <option disabled selected>
                  Select tag
                </option>
                {TAGS.map((tag) => {
                  <option> {tags} </option>;
                })}
              </select> */}

              {/* <select value={selectedOption}
              >
            {options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
            ))}
        </select> */}
            </div>
          </div>
        </div>

        <div className="bg-lensBlack rounded-lg my-6">
          <div className="px-6 w-full py-1 flex justify-between place-items-baseline bg-white border-2 rounded-lg border-lensBlack input-translate">
            <div>
              {' '}
              <p className="font-semibold">Link</p>
            </div>
            <div className="w-full">
              <input
                className="  w-full py-2 px-6 text-lensPurple bg-white outline-none"
                type="text"
                name="link"
                id="link"
                placeholder="Insert the link starting with 'https://'"
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-lensBlack rounded-lg my-6">
          <div className="px-6 w-full py-1 flex justify-between place-items-baseline bg-white border-2 rounded-lg border-lensBlack input-translate">
            <div>
              {' '}
              <p className="font-semibold">Abstract</p>
            </div>
            <div className="w-full">
              <input
                className=" w-full font-semibold px-3 py-2 mx-4 text-lensBlack bg-white outline-none"
                type="text"
                name="abstract"
                id="abstract"
                onChange={(e) => setAbstract(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-lensBlack rounded-lg my-6">
          <div className="px-2 w-full py-1 flex justify-between place-items-baseline bg-white border-2 rounded-lg border-lensBlack input-translate">
            <div className="w-full">
              <Editor
                initialContent={initialContent}
                onChange={handleChangeEditor}
              />
            </div>
          </div>

          <div className="h-full min-w-fit flex items-center justify-center  border-black  pl-8">
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

        <div className="flex justify-between items-center rounded-lg  my-6">
          <div className="bg-lensBlack w-full rounded-lg  ">
            <div className=" w-12/12 py-3  px-6 flex  items-center bg-white border-2 rounded-lg border-lensBlack input-translate">
              <div>
                <p className="font-semibold">Cover</p>
              </div>
              <div className="px-6 text-sm text-lensGray2 ">
                Upload image (Optional)
              </div>
            </div>
          </div>

          <div className="h-full min-w-fit flex items-center justify-center  border-black  pl-8">
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

          <div className="text-right pb-6">
            <div className="h-full min-w-fit flex items-center  justify-end border-black   pl-8 ">
              <button
                disabled={loading}
                onClick={() =>
                  handlePost().then(() => {
                    // useWaitFiveSeconds();
                  })
                }
                className="flex align-middle"
              >
                <div className="bg-lensPurple button_Nobg items-center text-lensGray flex">
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 ml-2"
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
                  <div className="text-xl px-4 py-2">Create Post</div>
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
