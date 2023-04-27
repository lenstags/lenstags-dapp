import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import CollapsiblePanels from 'components/Panels';
import CreatableSelect from 'react-select/creatable';
import { DEFAULT_METADATA_ATTRIBUTES } from '@lib/lens/post';
import Editor from 'components/Editor';
import { IbuiltPost } from '@lib/lens/interfaces/publication';
import { Layout } from 'components';
import { NextPage } from 'next';
import { ProfileContext } from 'components';
import { TAGS } from '@lib/lens/tags';
import Toast from '../../components/Toast';
import _ from 'lodash';
import { createPostManager } from '@lib/lens/post';
import { getBufferFromUpload } from '@lib/helpers'; // FIXME
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';

async function getBufferFromElement(url: string) {
  const response = await fetch(`/api/proxy?imageUrl=${url}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

type ToastContent = {
  message?: string;
  level?: string;
};

const checkIfUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 2500);
  });

const Create: NextPage = () => {
  const [title, setTitle] = useState('');
  const [dispatcherStatus, setDispatcherStatus] = useState<boolean | undefined>(
    undefined
  );
  const router = useRouter();
  const [abstract, setAbstract] = useState<string | undefined>('');
  const [editorContents, setEditorContents] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [toast, setToast] = useState<ToastContent>({});

  const [isToastVisible, setToastVisible] = useState(false);

  const [cover, setCover] = useState<File>();
  const [generatedImage, setGeneratedImage] = useState<any>();
  const [generatedImage2, setGeneratedImage2] = useState<any>(); // FIXME use only one

  const [imageURL, setImageURL] = useState('');
  const [actualPanel, setActualPanel] = useState<string | null>('panelAI');

  const [loading, setLoading] = useState(false);
  const [loadingTLDR, setLoadingTLDR] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);
  const [plainText, setPlainText] = useState('');

  useEffect(() => {
    const html = editorContents;
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent;
    setPlainText(text || '');
  }, [editorContents]);

  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
  };

  const handleActivePanelChange = (selectedPanel: string | null) => {
    setActualPanel(selectedPanel);
  };

  const lensProfile = useContext(ProfileContext);
  if (!lensProfile) {
    return null;
  }

  const fetchLinkPreview = async (url: string) => {
    const response = await fetch(`/api/linkPreview?url=${url}`);
    const jsonResponse = await response.json();
    return jsonResponse.data;
  };

  const fetchTLDR = async (text: string) => {
    const response = await fetch(`/api/tldr?text=${text}`);
    const jsonResponse = await response.json();
    return jsonResponse.data;
  };

  const fetchImageAI = async (text: string) => {
    const response = await fetch(`/api/imageAI?text=${text}`);
    const jsonResponse = await response.json();
    return jsonResponse.data;
  };

  const generateTLDR = async () => {
    setLoadingTLDR(true);
    if (plainText) {
      try {
        console.log('plainText ', plainText);

        const dataTLDR = await fetchTLDR(plainText);
        setAbstract(dataTLDR?.choices[0]?.text?.trim());
      } catch (err) {
        console.log(err);
      }
      setLoadingTLDR(false);
    }
  };

  queryProfile({ profileId: lensProfile.id }).then((profile) => {
    setDispatcherStatus(
      profile?.dispatcher?.canUseRelay ? profile.dispatcher.canUseRelay : false
    );
    return;
  });

  const handleInputChange = _.debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const isUrl = checkIfUrl(event.target.value);

      if (!isUrl) {
        return;
      }

      const data = await fetchLinkPreview(event.target.value);
      setSourceUrl(event.target.value);
      setTitle(data.title as string);
      setImageURL(data.image as string);
      setEditorContents(data.description as string);
    },
    2000
  );

  const handleIAImage = async () => {
    setLoadingIA(true);
    if (title) {
      const response = await fetchImageAI(title.substring(0, 1000));
      const imageB64 = 'data:image/png;base64,' + response.data[0].b64_json;
      setGeneratedImage(imageB64);
      setGeneratedImage2(response.data[0].b64_json);
    }
    setLoadingIA(false);
  };

  const handleChangeEditor = (content: string) => setEditorContents(content);

  const handlePost = async () => {
    // upload file to ipfs and get its url
    if (!title) {
      console.log('XXXttt ', title);
      toast.level = 'warning';
      toast.message = 'Title is required!';
      setToastVisible(true);
      return;
    }

    let imageBuffer: Buffer | null = null;

    if (actualPanel === 'panelUpload') {
      if (cover) {
        // FIXME
        // imageBuffer = await getBufferFromUpload(cover);
        // read the file as a Buffer
        const reader = new FileReader();
        reader.readAsArrayBuffer(cover);
        await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
              imageBuffer = Buffer.from(reader.result);
            } else if (reader.result !== null) {
              imageBuffer = Buffer.from(reader.result.toString());
            } else {
              // TODO: handle the case where reader.result is null
            }
            resolve(imageBuffer);
          };
          reader.onerror = () => {
            reject(reader.error);
          };
        });
      }
    }

    if (actualPanel === 'panelLink') {
      const imgTarget = imageURL ? imageURL : 'public/img/post.png';
      imageBuffer = await getBufferFromElement(imgTarget);
      console.log('imgTarget ', imageBuffer);
    }

    if (actualPanel === 'panelAI') {
      imageBuffer = generatedImage2
        ? Buffer.from(generatedImage2, 'base64')
        : null;
    }

    const constructedPost: IbuiltPost = {
      attributes: DEFAULT_METADATA_ATTRIBUTES,
      name: title,
      abstract: abstract || '',
      content: editorContents || '',
      link: sourceUrl,
      image: imageBuffer || null,
      imageMimeType: 'image/jpeg',
      tags: selectedOption.map((r) => r['value'])
      // TODO: GET FILTER ARRAY FROM THE UI
      // title: title,
      // todo: image?: Buffer[]
    };

    if (!lensProfile) {
      return;
    }

    setLoading(true);

    try {
      const result = await createPostManager(
        lensProfile,
        constructedPost,
        // POST_SELF_COLLECT
        false
      );
      console.log('POST RESULT: ', result);
      // FIXME
      // if (result.isOk) {
      // setIsSuccessVisible(true);

      toast.message = 'Post created successfully!';
      toast.level = 'success';
      setToastVisible(true);

      await sleep();
      router.push('/app');
      // } else {
      //   setIsErrorVisible(true);
      //   console.error(e);
      // }
    } catch (e: any) {
      setIsErrorVisible(true);
      console.error(e);
      setLoading(false);
    }
  };

  const panels = [
    {
      id: 'panelAI',
      title: 'AI Generated from the contents',
      content: (
        <div>
          <div className="flex ">
            <p className="mx-2 ml-4 w-5/6 pt-2 text-xs font-semibold text-gray-600">
              Write something in the editor below and click on Generate
            </p>

            <button
              onClick={handleIAImage}
              className="flex w-1/6 items-center justify-center rounded-md bg-gray-100 px-1 py-2 text-center text-xs text-black"
            >
              Generate
              {loadingIA && (
                <svg
                  className="ml-2 h-5 w-5 animate-spin items-center"
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
          <div className="  p-4 ">
            {generatedImage && (
              <img
                id="generatedImage"
                className="mx-auto"
                src={generatedImage}
                alt="AI generated image"
              />
            )}
          </div>
        </div>
      )
    },
    {
      id: 'panelLink',
      title: 'Link snapshot',
      content: (
        <div>
          <p className="  ml-4 pt-2 text-xs font-semibold text-gray-600">
            Paste a link in the upper field to extract a preview
          </p>
          <div className="p-4  ">
            {imageURL && (
              <img
                id="imageURL"
                className="  mx-auto "
                src={imageURL}
                alt="Image cover taken from the link"
              />
            )}
          </div>
        </div>
      )
    },

    {
      id: 'panelUpload',
      title: 'Upload from file',
      content: (
        <div className="my-2 flex">
          <span className="ml-4 w-1/2 text-xs font-semibold text-gray-600">
            Click and select a file
          </span>
          <input
            className="ml-4 w-1/2 rounded-md bg-gray-50 text-xs"
            type="file"
            name="cover"
            id="cover"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                const file = e.target.files[0];
                if (file) {
                  setCover(file);
                }
              }
            }}
          />
        </div>
      )
    }
  ];

  return (
    <Layout title="Lenstags | Create post" pageDescription="Create post">
      <div className="container mx-auto h-64  w-11/12 px-6 py-6 text-black md:w-1/2">
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
              Gasless tx{' '}
              {dispatcherStatus === undefined
                ? 'loading...'
                : dispatcherStatus
                ? 'enabled'
                : 'disabled'}
            </button>
          </div>
        </div>

        <div className="lens-input flex">
          <span className="ml-4 font-semibold">Link</span>
          <input
            autoComplete="false"
            className=" w-full bg-white px-4 py-2  outline-none"
            type="text"
            name="link"
            id="link"
            placeholder="Insert the link starting with 'https://'"
            onChange={handleInputChange}
          />
        </div>

        <div className="lens-input flex">
          <span className="ml-4 font-semibold">Title</span>
          <input
            className="w-full bg-white px-4 py-2 outline-none"
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </div>

        {/* abstract */}
        <div className="lens-input flex place-items-center items-center">
          <span className="ml-4 font-semibold">Abstract</span>
          <input
            className=" mx-4 w-4/5 bg-white py-2 pl-3 text-xs font-semibold text-black outline-none"
            type="text"
            name="abstract"
            value={abstract}
            id="abstract"
            onChange={(e) => setAbstract(e.target.value)}
          />

          <button
            onClick={generateTLDR}
            className="flex w-1/5 items-center justify-center rounded-md bg-gray-100 px-1 py-2 text-center text-xs text-black"
          >
            Make TLDR
            {loadingTLDR && (
              <svg
                className="ml-2 h-5 w-5 animate-spin items-center"
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

        <div className="lens-input">
          <p className="my-2 ml-4">Image source</p>
          <div className="px-4">
            <CollapsiblePanels
              panels={panels}
              onActivePanelChange={handleActivePanelChange}
            />
          </div>
        </div>

        <div className="lens-input -z-30">
          <div className="w-full">
            <Editor
              initialContent={editorContents}
              onChange={handleChangeEditor}
            />
          </div>
        </div>

        <div className="lens-input z-20 my-6 flex ">
          <span className="ml-4 font-semibold">Tags</span>
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

        <div className="text-right">
          {/* {isSuccessVisible && (
            <Toast text="Post created successfully!" level="success" />
          )}
          {isErrorVisible && (
            <Toast text="Something went wrong" level="error" />
          )} */}

          {isToastVisible && <Toast text={toast.message} level={toast.level} />}
          <div className="pb-6 text-right">
            <div className="flex h-full min-w-fit items-center  justify-end border-black   pl-8 ">
              {!loading ? (
                <button
                  onClick={() =>
                    handlePost().then(() => {
                      // FIXME
                      // useWaitFiveSeconds();
                    })
                  }
                  className="flex align-middle"
                >
                  <div className="button_Nobg flex items-center bg-lensPurple text-lensGray">
                    <div className="px-4 py-2 text-xl">Create post</div>
                  </div>
                </button>
              ) : (
                <button
                  // disabled={loading}
                  className="flex cursor-default align-middle"
                >
                  <div className=" flex items-center rounded-lg border-2 bg-white text-gray-400">
                    <svg
                      className="ml-4 h-5 w-5 animate-spin"
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
                    <div className="py-2 pl-2 pr-4 text-xl">Posting </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
