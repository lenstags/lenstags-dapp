import * as nsfwjs from 'nsfwjs';

import { DEFAULT_METADATA_ATTRIBUTES, createPostManager } from '@lib/lens/post';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/Dialog';
import {
  IbuiltPost,
  PublicationContentWarning
} from '@lib/lens/interfaces/publication';
import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { checkIfUrl, genericFetch, sleep } from 'utils/helpers';

import Avatar from 'boring-avatars';
import { CardViewsMap } from '@components/CardViewButtons';
import CreatableSelect from 'react-select/creatable';
import { DotWave } from '@uiball/loaders';
import Editor from 'components/Editor';
import { LayoutCreate } from '@components/LayoutCreate';
import { NOTIFICATION_TYPE } from '@pushprotocol/restapi/src/lib/payloads/constants';
import { NextPage } from 'next';
import { NotificationTypes } from '@models/notifications.models';
import PillTab from '@components/PillTab';
import { ProfileContext } from 'components';
import { Spinner } from '@components/Spinner';
import { TAGS } from '@lib/lens/tags';
import Toast from '../../components/Toast';
import TurndownService from 'turndown';
import { ViewBy } from '@context/ViewCardContext';
import _ from 'lodash';
import { followers } from '@lib/lens/followers';
import { queryProfile } from '@lib/lens/dispatcher';
import { sendNotification } from '@lib/lens/user-notifications';
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
fromHtml.keep(['br']);

fromHtml.addRule('headers', {
  filter: ['h1', 'h2'],
  replacement: (content, node) => {
    if (node.nodeName === 'H1') {
      return '# ' + content + '\n';
    }
    if (node.nodeName === 'H2') {
      return '## ' + content + '\n';
    }
    return '';
  }
});

fromHtml.addRule('headers', {
  filter: ['h3', 'h4', 'h5', 'h6'],
  replacement: (content, node) => {
    const level = Number(node.nodeName.charAt(1));
    return `${'#'.repeat(level)} ${content}\n`;
  }
});

fromHtml.addRule('code', {
  filter: ['pre'],
  replacement: (content) => {
    return '`' + content + '`\n';
  }
});

fromHtml.addRule('lineElementsToPlain', {
  filter: ['div', 'p'],
  replacement: (content) => {
    return content + '\n\n'; // dos saltos de línea para el formato Markdown de párrafo
  }
});

const Create: NextPage = () => {
  const [title, setTitle] = useState('');
  const snackbar = useSnackbar();
  const router = useRouter();
  const [model, setModel] = useState<NSFWJS | null>(null);

  // const [abstract, setAbstract] = useState<string | undefined>('');
  const [editorContents, setEditorContents] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [toast, setToast] = useState<ToastContent>({});
  const [isToastVisible, setToastVisible] = useState(false);
  const [isNSFW, setIsNSFW] = useState(false);
  const [cover, setCover] = useState<File>();
  const [generatedImage, setGeneratedImage] = useState<any>();
  const [generatedImage2, setGeneratedImage2] = useState<any>(); // FIXME use only one
  const [isTagSelected, setIsTagSelected] = useState<boolean>(false);
  const [isExplore, setIsExplore] = useState(false);
  const [skipExplore, setSkipExplore] = useState(true);
  const [post, setPost] = useState<any>();
  const [viewCard, setViewCard] = useState<
    typeof ViewBy.CARD | typeof ViewBy.POST | typeof ViewBy.LIST
  >(ViewBy.CARD);
  const [openPreview, setOpenPreview] = useState(false);

  const [imageURL, setImageURL] = useState('');
  const [imageOrigin, setImageOrigin] = useState<string | null>('panelAI');

  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingLP, setLoadingLP] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);
  const [plainText, setPlainText] = useState('');
  const { profile: lensProfile } = useContext(ProfileContext);
  const inputFile = useRef<HTMLInputElement>(null);

  const [hydrationLoading, setHydrationLoading] = useState(true);
  useEffect(() => {
    setHydrationLoading(false);
  }, []);

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
      setPost({
        ...post,
        content: text || '',
        metadata: {
          ...post?.metadata,
          content: text || ''
        }
      });
    }
  }, [editorContents]);

  useEffect(() => {
    nsfwjs.load().then(setModel);
  }, []);

  const handleTagsChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
    setPost({
      ...post,
      metadata: {
        ...post?.metadata,
        tags: selectedOptions.map((r: any) => r['value'])
      }
    });
  };

  console.log('post: ', post);

  // const handleActivePanelChange = (selectedPanel: string | null) => {
  //   setActualPanel(selectedPanel);
  // };

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
        setImageOrigin('panelAI');

        setGeneratedImage2(response.data.data[0].b64_json);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log('error on ai call: ', err);
        snackbar.showMessage(
          'Something went wrong generating the image, try again in a few minutes'
        );
      })
      .finally(() => setLoadingIA(false));
  };

  // deprecated but useful
  // const handleGenerateTLDR = async () => {
  //   if (!plainText) {
  //     snackbar.showMessage('⚠️ Some text in the body is required!');
  //     return;
  //   }
  //   setLoadingTLDR(true);

  //   return genericFetch(`/api/tldr?text=${plainText}`)
  //     .then((response) => {
  //       console.log('ss', response);
  //       setAbstract(response.data.choices[0]?.text?.trim());
  //     })
  //     .catch((err) => {
  //       console.log('error on ai call: ', err);
  //       snackbar.showMessage(
  //         'Something went wrong generating the TLDR, try again in a few minutes'
  //       );
  //     })
  //     .finally(() => setLoadingTLDR(false));
  // };

  const handleInputChange = _.debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const isUrl = checkIfUrl(event.target.value);

      if (!isUrl) {
        return;
      }

      setSourceUrl(event.target.value);

      const data = await fetchLinkPreview(event.target.value);
      if (data) {
        setTitle(data.title as string);
        setImageURL(data.image as string);

        const imgTarget = data.image ? data.image : 'public/img/post.png';
        const imageBuffer = await getBufferFromElement(imgTarget);
        console.log('i1: ', imageBuffer.toString('base64'));

        setGeneratedImage(
          `data:image/png;base64,${imageBuffer.toString('base64')}`
        );
        setEditorContents(data.description as string);
        setPost({
          attributes: DEFAULT_METADATA_ATTRIBUTES,
          name: data.title as string,
          abstract: '',
          content: data.description as string,
          link: event.target.value,
          locale: 'en',
          image: imageBuffer,
          imageMimeType: 'image/jpeg',
          tags: [],
          profile: lensProfile,
          metadata: {
            ...post?.metadata,
            attributes: DEFAULT_METADATA_ATTRIBUTES,
            name: data.title as string,
            content: data.description as string,
            image: data.image as string,
            media: [
              {
                original: {
                  url: data.image as string
                }
              }
            ]
          },
          stats: {
            totalAmountOfCollects: 0,
            totalAmountOfComments: 0
          }
        });
      } else {
        console.log('No link preview');
      }
    },
    1000
  );

  const handleClickUpload = () => {
    // `current` points to the mounted file input element
    if (inputFile.current) {
      setImageOrigin('panelUpload');
      inputFile.current.click();
    }
  };

  const handleClickLink = async () => {
    if (!sourceUrl) {
      snackbar.showMessage('⚠️ A link is required!');
      return;
    }

    const data = await fetchLinkPreview(sourceUrl);

    if (data) {
      setImageURL(data.image as string);
      setImageOrigin('panelLink');
      // setGeneratedImage(data.image as string);
      setPost({
        attributes: DEFAULT_METADATA_ATTRIBUTES,
        name: data.title as string,
        abstract: '',
        content: data.description as string,
        link: sourceUrl,
        locale: 'en',
        image: data.image as string,
        imageMimeType: 'image/jpeg',
        tags: [],
        profile: lensProfile,
        metadata: {
          ...post?.metadata,
          attributes: DEFAULT_METADATA_ATTRIBUTES,
          name: data.title as string,
          content: data.description as string,
          image: data.image as string,
          media: [
            {
              original: {
                url: data.image as string
              }
            }
          ]
        },
        stats: {
          totalAmountOfCollects: 0,
          totalAmountOfComments: 0
        }
      });
      setIsLoaded(true);
    } else {
      snackbar.showMessage('⚠️ Link does not contain image preview');
      setIsLoaded(false);
    }
  };

  const BuildPostPreview = async () => {
    let imageBuffer: Buffer | null = null;

    imageBuffer = await getBufferFromElement(
      imageURL
      // imageURL ? imageURL : 'public/img/post.png'
    );

    if (imageOrigin === 'panelUpload') {
      console.log('aca ', cover);
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

    if (imageOrigin === 'panelLink') {
      const imgTarget = imageURL ? imageURL : 'public/img/post.png';
      imageBuffer = await getBufferFromElement(imgTarget);
    }

    if (imageOrigin === 'panelAI') {
      imageBuffer = generatedImage2
        ? Buffer.from(generatedImage2, 'base64')
        : null;
    }

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

    setPost({
      ...post,
      attributes: DEFAULT_METADATA_ATTRIBUTES,
      name: title || ' ',
      abstract: '',
      content: editorContents || '',
      link: sourceUrl,
      locale: 'en',
      image: imageBuffer || null,
      imageMimeType: 'image/jpeg',
      profile: lensProfile,
      metadata: {
        ...post?.metadata,
        attributes: DEFAULT_METADATA_ATTRIBUTES,
        name: title || ' ',
        content: editorContents || '',
        image: imageBuffer || null,
        media: [
          {
            original: {
              url: imageURL
            }
          }
        ],
        tags: selectedOption.map((r) => r['value'])
      },
      stats: {
        totalAmountOfCollects: 0,
        totalAmountOfComments: 0
      }
    });
  };

  const handlePreview = async () => {
    await BuildPostPreview().then(() => {
      setOpenPreview(true);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;
        setGeneratedImage(result as string);
        setIsLoaded(true);
        if (e.target?.files![0]) {
          setCover(e.target.files[0]);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChangeEditor = (content: string) => {
    const existing = fromHtml.turndown(content);
    setEditorContents(existing);
  };

  const handlePost = async () => {
    if (!selectedOption || selectedOption.length === 0) {
      snackbar.showMessage('⚠️ You forgot to select at least ONE tag!');
      return;
    }

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

    imageBuffer = await getBufferFromElement(
      imageURL
      // imageURL ? imageURL : 'public/img/post.png'
    );

    if (imageOrigin === 'panelUpload') {
      console.log('aca ', cover);
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

    if (imageOrigin === 'panelLink') {
      const imgTarget = imageURL ? imageURL : 'public/img/post.png';
      imageBuffer = await getBufferFromElement(imgTarget);
    }

    if (imageOrigin === 'panelAI') {
      imageBuffer = generatedImage2
        ? Buffer.from(generatedImage2, 'base64')
        : null;
    }

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
      abstract: '',
      content: editorContents || '',
      link: sourceUrl,
      locale: 'en',
      image: imageBuffer || null,
      imageMimeType: 'image/jpeg',
      tags: selectedOption.map((r) => r['value']),
      contentWarning: isNSFW ? PublicationContentWarning.NSFW : undefined
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

      // /* Send Notification for followers: create post */
      const listFollowers = await followers(lensProfile?.id);
      const listAddressByFollowers = listFollowers.items.map(
        (follower) => follower.wallet.address
      );
      const { pubId } =
        typeof result !== 'string' && result.pubId ? result : { pubId: '' };
      const id = `${lensProfile?.id}-${pubId}`;
      const dataSender = {
        title,
        pubId,
        id
      };
      if (lensProfile?.name) {
        if (listAddressByFollowers.length > 1) {
          sendNotification(
            listAddressByFollowers,
            NotificationTypes.CreatedPost,
            lensProfile.name,
            NOTIFICATION_TYPE.SUBSET,
            JSON.stringify(dataSender),
            lensProfile.id
          );
        } else if (listAddressByFollowers.length === 1) {
          sendNotification(
            [listAddressByFollowers[0]],
            NotificationTypes.CreatedPost,
            lensProfile.name,
            NOTIFICATION_TYPE.TARGETTED,
            JSON.stringify(dataSender),
            lensProfile.id
          );
        }
      }
      await sleep(2500);
      router.push('/app');
    } catch (e: any) {
      // setIsErrorVisible(true);
      console.error(e);
      snackbar.showMessage('❌ Error: ' + e.message);
      setLoading(false);
    }
  };

  // const handleUpload = async () => {
  //   const reader = new FileReader();
  //   reader.readAsArrayBuffer(cover);
  //   await new Promise((resolve, reject) => {
  //     reader.onloadend = () => {
  //       if (reader.result instanceof ArrayBuffer) {
  //         imageBuffer = Buffer.from(reader.result);
  //       } else if (reader.result !== null) {
  //         imageBuffer = Buffer.from(reader.result.toString());
  //       } else {
  //         // TODO: handle the case where reader.result is null
  //       }
  //       resolve(imageBuffer);
  //     };
  //     reader.onerror = () => {
  //       return snackbar.showMessage('❌ Upload failed! Please try again.');
  //     };
  //   });
  // };

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
    <LayoutCreate
      title="Nata Social | Create post"
      pageDescription="Create post"
      breadcumpTitle="Create post"
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      {hydrationLoading ? (
        <div className="flex w-full justify-center p-10">
          <Spinner h="10" w="10" />
        </div>
      ) : (
        <div className="flex w-full">
          <div className="w-8/12 ">
            {/* image uploader */}

            {isLoaded ? (
              <div
                // className="relative mb-6 flex h-40 w-full flex-col place-items-center rounded-lg
                // border border-solid border-zinc-100 p-8 hover:h-80"
                className="transition-height relative mb-6 flex h-40 w-full flex-col place-items-center
                rounded-lg border border-solid border-zinc-100 p-8
                duration-500 ease-in-out hover:h-96"
                style={{
                  backgroundImage: `url(${generatedImage})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="absolute right-2 top-2">
                  <button
                    onClick={() => setIsLoaded(false)}
                    className="inline-flex h-7 w-7 items-center justify-center
               rounded-[40px] bg-stone-50 bg-opacity-70 p-1.5 backdrop-blur-[14px]"
                  >
                    <div className="inline-flex items-center justify-start gap-2 self-stretch">
                      <div className="relative h-4 w-4">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_3100_65103)">
                            <path
                              d="M11.2411 2.99111L12.3661 1.86612C12.8543 1.37796 13.6457 1.37796 14.1339 1.86612C14.622 2.35427 14.622 3.14573 14.1339 3.63388L4.55479 13.213C4.20234 13.5654 3.76762 13.8245 3.28993 13.9668L1.5 14.5L2.03319 12.7101C2.17548 12.2324 2.43456 11.7977 2.78701 11.4452L11.2411 2.99111ZM11.2411 2.99111L13 4.74999"
                              stroke="#121212"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_3100_65103">
                              <rect width="16" height="16" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="mb-6 flex h-44 w-full flex-col
              place-items-center rounded-lg border border-dashed border-stone-300 p-8"
              >
                {/* <Image
              src="/icons/add-cover.svg"
              alt="Add a file"
              height={40}
              width={40}
            /> */}

                <span className="mb-4 text-xl font-medium leading-7 text-neutral-900">
                  Choose a cover image
                </span>

                <span className="mb-4 text-base font-normal leading-normal text-neutral-600">
                  Upload your image, generate with AI or take from the link you
                  provided.
                </span>

                <div className="flex gap-4">
                  <input
                    type="file"
                    id="file"
                    ref={inputFile}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <button
                    className="rounded-lg border border-solid border-black
                  bg-white px-9 py-2 text-xs font-bold"
                    onClick={handleClickUpload}
                  >
                    Upload
                  </button>

                  {loadingIA ? (
                    <div
                      className="flex items-center rounded-lg border border-solid
                    border-black bg-white px-9 py-2 text-xs font-bold"
                      onClick={handleGeneratePic}
                    >
                      Generating
                      <div className="ml-2">
                        <DotWave size={14} color="#231F20" />
                      </div>
                    </div>
                  ) : (
                    <button
                      className="rounded-lg border border-solid border-black bg-white
                      px-9 py-2 text-xs font-bold"
                      onClick={handleGeneratePic}
                    >
                      AI Image
                    </button>
                  )}

                  <button
                    onClick={handleClickLink}
                    className="rounded-lg border border-solid border-black bg-white
               px-9 py-2 text-xs font-bold"
                  >
                    Link Image
                  </button>
                </div>
              </div>
            )}

            {/* the editor  */}
            <div className="h-[540px] rounded-lg border border-zinc-100 p-4">
              <input
                className="mb-3 w-full text-xl leading-normal text-neutral-400  outline-none"
                type="text"
                name="title"
                placeholder="Title"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setPost({
                    ...post,
                    name: e.target.value,
                    metadata: {
                      ...post?.metadata,
                      name: e.target.value
                    }
                  });
                }}
              />
              <Editor
                initialContent={editorContents}
                onChange={handleChangeEditor}
              />
            </div>
          </div>

          <div className="ml-16 w-4/12 justify-center">
            <div className="mb-10 rounded-lg border">
              <div className="bg-zinc-100 px-4 py-3 font-serif text-base font-bold leading-normal ">
                Settings
              </div>
              <div className=" text-sm">
                {/* link */}
                <div className="mb-4 mt-5 items-center px-4 ">
                  <div className="flex items-center justify-between">
                    <div className="mb-1">Create from a link</div>
                    {loadingLP && (
                      <div className="mr-2">
                        <DotWave size={14} color="#231F20" />
                      </div>
                    )}
                  </div>
                  <div className="flex w-full">
                    <input
                      autoComplete="false"
                      className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-xs outline-none"
                      type="text"
                      name="link"
                      id="link"
                      placeholder="Insert the link starting with 'https://'"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* tags  */}
                <div className="mb-4 items-center px-4 py-2">
                  <label className="mb-1">Select your tags</label>
                  <div className="w-full rounded-lg border bg-stone-50 ">
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
                        placeholder="Choose 1 tag minimum"
                        menuPortalTarget={document.querySelector('body')}
                        isMulti
                        onChange={handleTagsChange}
                        options={TAGS}
                      />
                    )}
                  </div>
                </div>
                {/* NSFW switch  */}
                <div className="mb-4 items-center px-4 py-2">
                  <div className="mb-1 flex ">
                    This post contains sensitive content
                    <input
                      checked={isNSFW}
                      onChange={() => setIsNSFW(!isNSFW)}
                      type="checkbox"
                      className="form-checkbox ml-2 h-5 w-5"
                      style={{
                        backgroundColor: isNSFW ? 'purple' : '',
                        borderColor: isNSFW ? 'purple' : 'gray'
                      }}
                    />
                  </div>
                </div>
                {/* preview */}
                <Dialog
                  open={openPreview}
                  onOpenChange={(isOpen) => {
                    if (!openPreview) return;
                    setOpenPreview(isOpen);
                  }}
                >
                  <DialogTrigger
                    className="mb-4 ml-4 items-center px-8 py-1 disabled:border-0 disabled:bg-gray-200 disabled:text-gray-600 disabled:opacity-50 disabled:hover:bg-gray-200"
                    style={{ border: '2px solid #000' }}
                    disabled={!post?.metadata.name || !post?.metadata.content}
                    onClick={handlePreview}
                  >
                    Preview
                  </DialogTrigger>
                  <DialogContent className="z-50 flex min-w-[1000px] flex-col items-center gap-8">
                    <DialogHeader className="w-full">
                      <DialogTitle className="text-xl">
                        Preview mode
                      </DialogTitle>
                    </DialogHeader>
                    <article
                      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto flex min-h-[310px] list-none items-center justify-center ${
                        viewCard === ViewBy.CARD ? 'w-96' : 'w-full'
                      }`}
                    >
                      {post.metadata.attributes &&
                        CardViewsMap[viewCard]({
                          post: post,
                          refProp: null
                        })}
                    </article>
                    <PillTab viewCard={viewCard} setViewCard={setViewCard} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* hidden default image DO NOT REMOVE */}
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
                  colors={[
                    '#413E4A',
                    '#73626E',
                    '#B38184',
                    '#F0B49E',
                    '#F7E4BE'
                  ]}
                />
              </div>
            </div>

            {/* create button  */}
            <div className="flex w-full justify-center ">
              {isToastVisible && (
                <Toast text={toast.message} level={toast.level} />
              )}
              <div
                className="flex h-full min-w-fit items-center justify-end
             border-black "
              >
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
                    <span
                      className=" flex w-40 items-center justify-center rounded-lg bg-black py-2
                     text-sm  text-white"
                    >
                      + Create
                    </span>
                  </button>
                ) : (
                  <div className="flex w-40 items-center justify-center rounded-lg bg-black  py-2 text-sm text-white">
                    <div className=" pl-4 pr-4 ">Posting</div>
                    <div className="mr-2">
                      <DotWave size={22} color="#FFFFFF" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutCreate>
  );
};

export default Create;
