import { Configuration, OpenAIApi } from 'openai';
import React, { useContext, useEffect, useState } from 'react';

import CreatableSelect from 'react-select/creatable';
import { DEFAULT_METADATA_ATTRIBUTES } from '@lib/lens/post';
import Editor from 'components/Editor';
import { IbuiltPost } from '@lib/lens/interfaces/publication';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import Link from 'next/link';
import { NextPage } from 'next';
import { ProfileContext } from 'components';
import { TAGS } from '@lib/lens/tags';
import Toast from '../../components/Toast';
import cheerio from 'cheerio';
import { createPostManager } from '@lib/lens/post';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 2500);
  });

interface ParsedPage {
  title: string | null;
  coverImage: string | null;
}

// async function parsePage(url: string): Promise<ParsedPage> {
//   const response = await fetch(url);
//   const html = await response.text();
//   const { window } = new JSDOM(html);
//   const { document } = window;

//   // Extract the page title
//   const titleElement = document.querySelector('head title');
//   const title = titleElement?.textContent || null;

//   // Extract the main cover image
//   let coverImageElement = document.querySelector('meta[property="og:image"]');
//   let coverImage = coverImageElement?.getAttribute('content') || null;
//   if (!coverImage) {
//     const imgElements = document.querySelectorAll('img');
//     for (let i = 0; i < imgElements.length; i++) {
//       const imgSrc = imgElements[i].getAttribute('src') || '';
//       if (imgSrc.includes('cover') || imgSrc.includes('thumbnail')) {
//         coverImage = imgSrc;
//         break;
//       }
//     }
//   }

//   return { title, coverImage };
// }

export async function parsePage(url: string): Promise<ParsedPage> {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'no-cors'
  });
  console.log(response);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract the page title
  const title = $('head title').text() || null;

  // Extract the main cover image
  let coverImage = $('meta[property="og:image"]').attr('content') || null;
  if (!coverImage) {
    const images = $('img');
    if (images.length > 0) {
      coverImage = $(images[0]).attr('src') || null;
    }
  }

  return { title, coverImage };
}

const Create: NextPage = () => {
  const [title, setTitle] = useState('');
  const [dispatcherStatus, setDispatcherStatus] = useState<boolean | undefined>(
    undefined
  );

  const router = useRouter();
  const [abstract, setAbstract] = useState('');
  const [pageCover, setPageCover] = useState<any>('');
  const [pageTitle, setPageTitle] = useState<any>('');

  const [editorContents, setEditorContents] = useState('');
  const [link, setLink] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [cover, setCover] = useState<File>();
  const [generatedImage, setGeneratedImage] = useState<any>();

  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
  };

  //handles IA image generation
  useEffect(() => {
    const fetchData = async () => {
      const configuration = new Configuration({
        organization: 'org-Bxsu1oLlJ2mEEDGJRO6TiJCz',
        apiKey: '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'
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai.createImage({
        prompt: 'beautiful and modern scandinavian  logo',
        n: 1,
        size: '256x256'
      });
      setGeneratedImage(response.data.data[0].url);
    };

    fetchData();
  }, []);

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

  const handleLink = async (url: string) => {
    // validate url and extract values

    const parsedPage: ParsedPage = await parsePage(url);
    console.log('parsedPage ', parsedPage);
    if (parsedPage) {
      setPageCover(parsedPage.coverImage);
      setPageTitle(parsedPage.title);
    }
    // onChange={(e) => handleLink(e.target.value)}
  };

  const handleChangeEditor = (content: string) => setEditorContents(content);
  // todo lit protocol
  // TODO ia tldr

  const handlePost = async () => {
    // upload file to ipfs and get its url

    let imageBuffer: Buffer | null = null;
    if (cover) {
      // read the file as a Buffer
      const reader = new FileReader();
      reader.readAsArrayBuffer(cover);
      await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          // imageBuffer = Buffer.from(reader.result);

          if (reader.result instanceof ArrayBuffer) {
            imageBuffer = Buffer.from(reader.result);
          } else if (reader.result !== null) {
            imageBuffer = Buffer.from(reader.result.toString());
          } else {
            // handle the case where reader.result is null
          }
          resolve(imageBuffer);
        };

        reader.onerror = () => {
          reject(reader.error);
        };
      });
    }

    const constructedPost: IbuiltPost = {
      attributes: DEFAULT_METADATA_ATTRIBUTES,
      name: title,
      abstract: abstract || '',
      content: editorContents || '',
      link: link,
      image: imageBuffer || null,
      imageMimeType: 'image/jpeg',
      tags: selectedOption.map((r) => r['label'])
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
      setIsSuccessVisible(true);
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
              Gasless tx are{' '}
              {dispatcherStatus === undefined
                ? 'loading...'
                : dispatcherStatus
                ? 'Enabled'
                : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="lens-input flex">
          <span className="ml-4 font-semibold">Link</span>
          <input
            className="w-full bg-white px-4 py-2 outline-none"
            type="text"
            name="link"
            id="link"
            placeholder="Insert the link starting with 'https://'"
            onChange={(e) => handleLink(e.target.value)}
          />
        </div>

        <div className="lens-input flex">
          <span className="ml-4 font-semibold">Title</span>
          <input
            className="w-full bg-white px-4 py-2 outline-none"
            type="text"
            name="title"
            id="title"
            defaultValue={pageCover}
            onChange={(e) => {
              setTitle(e.target.value);
              return;
            }}
          />
        </div>

        <div className="lens-input flex">
          <span className="ml-4 font-semibold">Abstract</span>
          <input
            className=" mx-4 w-full bg-white px-3 py-2 font-semibold text-lensBlack outline-none"
            type="text"
            name="abstract"
            id="abstract"
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>

        <div className="lens-input">
          <p className="ml-4 pt-2 font-semibold">Generated AI image</p>
          <div className="p-4">
            <img src={generatedImage} alt="AI generated image" />
          </div>
        </div>

        <div className="lens-input flex py-2">
          <span className="ml-4 font-semibold">Cover</span>
          <input
            className="ml-4 w-full"
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

        <div className="lens-input -z-30">
          <div className="w-full">
            <Editor
              initialContent={initialContent}
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
