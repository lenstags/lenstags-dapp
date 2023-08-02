import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import Avatar from 'boring-avatars';
import BackButton from '@components/ui/ButtonBack';
import CollapsiblePanels from 'components/Panels';
import CreatableSelect from 'react-select/creatable';
import { DEFAULT_METADATA_ATTRIBUTES } from '@lib/lens/post';
import { DotWave } from '@uiball/loaders';
import Editor from 'components/Editor';
import { IbuiltPost } from '@lib/lens/interfaces/publication';
import { Layout } from 'components';
import { NextPage } from 'next';
import { ProfileContext } from 'components';
import { TAGS } from '@lib/lens/tags';
import Toast from '../../components/Toast';
import TurndownService from 'turndown';
import _ from 'lodash';
import { createPostManager } from '@lib/lens/post';
import { genericFetch } from '@lib/helpers';
import { queryProfile } from '@lib/lens/dispatcher';
import { useRouter } from 'next/router';
import { useSnackbar } from 'material-ui-snackbar-provider';

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

const fromHtml = new TurndownService();

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
  const snackbar = useSnackbar();

  // const [dispatcherStatus, setDispatcherStatus] =
  //  useState<boolean | undefined>(
  //   undefined
  // );
  const router = useRouter();
  const [abstract, setAbstract] = useState<string | undefined>('');
  const [editorContents, setEditorContents] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
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
  const [loadingLP, setLoadingLP] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);
  const [plainText, setPlainText] = useState('');
  const { profile: lensProfile } = useContext(ProfileContext);

  // useEffect(() => {
  //   if (document) {
  //     const html = editorContents;
  //     const div = document.createElement('div');
  //     div.innerHTML = html;
  //     const text = div.textContent;
  //     setPlainText(text || '');
  //   }
  // }, [editorContents]);

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const html = editorContents;
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent;
      setPlainText(text || '');
    }
  }, [editorContents]);

  const handleTagsChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
  };

  const handleActivePanelChange = (selectedPanel: string | null) => {
    setActualPanel(selectedPanel);
  };

  const fetchLinkPreview = async (url: string) => {
    setLoadingLP(true);

    return genericFetch(`/api/linkPreview?url=${url}`)
      .then((response) => response.data)
      .catch((err) => {
        console.log('error linkPreview  call: ', err);
        snackbar.showMessage(
          'Something went wrong getting the link preview, try again in a few minutes'
        );
      })
      .finally(() => setLoadingLP(false));
  };

  const handleGeneratePic = async () => {
    if (!title) {
      snackbar.showMessage('⚠️ A title is required!');
      return;
    }
    setLoadingIA(true);

    return genericFetch(`/api/imageAI?text=${title.substring(0, 1000)}`)
      .then((response) => {
        const imageB64 =
          'data:image/png;base64,' + response.data.data[0].b64_json;
        setGeneratedImage(imageB64);
        setGeneratedImage2(response.data.data[0].b64_json);
      })
      .catch((err) => {
        console.log('error on ai call: ', err);
        snackbar.showMessage(
          'Something went wrong generating the image, try again in a few minutes'
        );
      })
      .finally(() => setLoadingIA(false));
  };

  const handleGenerateTLDR = async () => {
    if (!plainText) {
      snackbar.showMessage('⚠️ Some text in the body is required!');
      return;
    }
    setLoadingTLDR(true);

    return genericFetch(`/api/tldr?text=${plainText}`)
      .then((response) => {
        console.log('ss', response);
        setAbstract(response.data.choices[0]?.text?.trim());
      })
      .catch((err) => {
        console.log('error on ai call: ', err);
        snackbar.showMessage(
          'Something went wrong generating the TLDR, try again in a few minutes'
        );
      })
      .finally(() => setLoadingTLDR(false));
  };

  const handleInputChange = _.debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const isUrl = checkIfUrl(event.target.value);

      if (!isUrl) {
        return;
      }

      const data = await fetchLinkPreview(event.target.value);

      setSourceUrl(event.target.value);

      if (data) {
        setTitle(data.title as string);
        setImageURL(data.image as string);
        setEditorContents(data.description as string);
      } else {
        console.log('No link preview');
      }
    },
    2000
  );

  const handleChangeEditor = (content: string) => {
    console.log('rr ', content);

    const existing = fromHtml.turndown(content);
    // if (existing !== $content) {
    //     const html = htmlFromMarkdown($content);
    //     editor.setContent(html);
    // }
    // console.log(existing);

    // const existing = fromHtml.turndown(textInput.innerHTML)
    // if (existing !== $content) {
    //     const html = htmlFromMarkdown($content);
    //     editor.setContent(html);
    // }

    return setEditorContents(content);
  };

  const handlePost = async () => {
    if (!title) {
      snackbar.showMessage('⚠️ Attention: Title is required!');
      return;
    }

    setLoading(true);
    const profileResult = await queryProfile({ profileId: lensProfile?.id });

    if (!profileResult) {
      snackbar.showMessage('❌ You are not connected!');
    }

    let imageBuffer: Buffer | null = null;

    if (actualPanel === 'panelUpload') {
      if (cover) {
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
            return snackbar.showMessage('❌ Upload failed! Please try again.');
          };
        });
      }
    }

    if (actualPanel === 'panelLink') {
      const imgTarget = imageURL ? imageURL : 'public/img/post.png';
      imageBuffer = await getBufferFromElement(imgTarget);
    }

    if (actualPanel === 'panelAI') {
      imageBuffer = generatedImage2
        ? Buffer.from(generatedImage2, 'base64')
        : null;
    }

    //     SI ES UN DEFAULT POST (LIST) DEBERIA TENER OTROS ATRIBUTOS?
    //      {
    //     traitType: 'string',
    //     value: 'post',
    //     key: 'publicationType' // ex default_key
    //   }
    //   const otherAttributes = [ // PORQUE NO ESTA EN EL BUILTPOST ORIGINAL???
    //   {
    //     traitType: 'string',
    //     key: 'userLink',
    //     value: builtPost.link || 'NO-LINK'
    //   },
    //   {
    //     traitType: 'string',
    //     key: 'customData',
    //     value: builtPost.originalPostId || ''
    //   }
    // ];

    if (!imageBuffer) {
      const parentNode = document.getElementById('defaultImage');

      if (parentNode) {
        const svgNode = parentNode.firstElementChild;
        if (svgNode) {
          const { toPng } = await import('html-to-image');
          try {
            const dataUrl = await toPng(svgNode as HTMLElement);
            const base64Image = dataUrl.split(';base64,').pop();
            imageBuffer = base64Image
              ? Buffer.from(base64Image, 'base64')
              : null;
          } catch (error) {
            console.error('Could not create image from SVG:', error);
          }
        }
      }
    }

    const constructedPost: IbuiltPost = {
      attributes: DEFAULT_METADATA_ATTRIBUTES,
      name: title || ' ',
      abstract: abstract || '',
      content: editorContents || '',
      link: sourceUrl,
      locale: 'en',
      image: imageBuffer || null,
      imageMimeType: 'image/jpeg',
      tags: selectedOption.map((r) => r['value'])
      // TODO: GET FILTER ARRAY FROM THE UI
      // title: title,
      // todo: image?: Buffer[]
    };

    try {
      const result = await createPostManager(
        profileResult,
        constructedPost,
        false // TODO FIXME POST_SELF_COLLECT
      );
      console.log('POST RESULT: ', result);
      snackbar.showMessage('👌🏻 Post created successfully!');
      await sleep();
      router.push('/app');
    } catch (e: any) {
      // setIsErrorVisible(true);
      console.error(e);
      snackbar.showMessage('❌ Error: ' + e.message);
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
              Write something in the title and click Generate
            </p>

            <button
              onClick={handleGeneratePic}
              className="flex w-1/6 items-center justify-center rounded-md bg-black px-1 py-2 text-center font-serif text-xs text-white"
            >
              GENERATE
              {loadingIA && (
                <div className="ml-2">
                  <DotWave size={22} color="#FFFFFF" />
                </div>
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
    <Layout title="Nata Social | Create post" pageDescription="Create post">
      <div className="w-full px-6 pt-6 font-sans text-sm ">
        {/* title  */}
        <div className="flex items-center">
          <BackButton />
          <h1 className="py-2 font-serif font-medium">Create post</h1>
        </div>

        <div className="mb-4 flex items-center">
          <div className="w-2/12">Link</div>
          <div className="w-10/12">
            <input
              autoComplete="false"
              className="lens-input outl ine-none w-full"
              type="text"
              name="link"
              id="link"
              placeholder="Insert the link starting with 'https://'"
              onChange={handleInputChange}
            />
          </div>
          {loadingLP && (
            <div className="ml-2">
              <DotWave size={22} color="#231F20" />
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center">
          <div className="w-2/12">Title</div>
          <div className="w-10/12">
            <input
              className="lens-input w-full"
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
        </div>

        {/* abstract */}
        <div className="mb-4 flex items-center">
          <div className="w-2/12">Abstract</div>
          <div className="w-8/12">
            <input
              className="lens-input w-full"
              type="text"
              name="abstract"
              value={abstract}
              id="abstract"
              onChange={(e) => setAbstract(e.target.value)}
            />
          </div>

          <button
            className="ml-2 flex w-2/12 items-center justify-center whitespace-nowrap rounded-md
             bg-black p-2 text-center font-serif text-xs text-white"
            onClick={handleGenerateTLDR}
          >
            GENERATE TLDR
            {loadingTLDR && (
              // <svg
              //   className="ml-2 h-5 w-5 animate-spin items-center"
              //   xmlns="http://www.w3.org/2000/svg"
              //   fill="none"
              //   viewBox="0 0 24 24"
              // >
              //   <circle
              //     className="opacity-25"
              //     cx="12"
              //     cy="12"
              //     r="10"
              //     stroke="currentColor"
              //     strokeWidth="4"
              //   ></circle>
              //   <path
              //     className="opacity-75"
              //     fill="currentColor"
              //     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              //   ></path>
              // </svg>
              <div className="ml-2">
                <DotWave size={22} color="#FFFFFF" />
              </div>
            )}
          </button>
        </div>

        <div className="mb-2 flex items-center">Image source</div>

        <div className="mb-4 w-full">
          <CollapsiblePanels
            panels={panels}
            onActivePanelChange={handleActivePanelChange}
          />
        </div>

        <div className="mb-2 flex items-center">
          Contents
          <i className="ml-6 text-xs text-gray-300">
            Double click on any word to stylize
          </i>
        </div>

        <div className="mb-4 w-full rounded-lg border border-black p-2">
          <Editor
            initialContent={editorContents}
            onChange={handleChangeEditor}
          />
        </div>

        <div className="mb-4 flex items-center">
          <div className="w-2/12">Tags</div>
          <div className="w-10/12">
            <div className="w-full rounded-lg border border-black bg-stone-100 ">
              {typeof window !== 'undefined' && (
                <CreatableSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      boxShadow: 'none',
                      margin: '2px',
                      borderColor: 'transparent',
                      '&:hover': {
                        borderColor: 'transparent'
                      }
                    })
                  }}
                  menuPortalTarget={document.querySelector('body')}
                  isMulti
                  onChange={handleTagsChange}
                  options={TAGS}
                />
              )}
            </div>
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
                  <div className=" flex items-center rounded-lg bg-black px-4 py-2 font-serif font-bold text-white">
                    CREATE POST
                  </div>
                </button>
              ) : (
                <button className="flex cursor-default align-middle">
                  <div className=" flex items-center rounded-lg border-2 bg-black font-serif text-white">
                    <div className="py-2 pl-4 pr-4 ">Posting</div>
                    <div className="mr-2">
                      <DotWave size={22} color="#FFFFFF" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          id="defaultImage"
          style={{
            height: 0,
            width: 0,
            overflow: 'hidden',
            padding: 0,
            border: 0,
            margin: 0
          }}
        >
          <Avatar
            size={512}
            name={title + editorContents}
            square={true}
            variant="marble"
            // colors={
            // ['#180A29', '#49007E', '#FF005B', '#FF7D10', '#FFB238']
            colors={['#413E4A', '#73626E', '#B38184', '#F0B49E', '#F7E4BE']}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Create;
