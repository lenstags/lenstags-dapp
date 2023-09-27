// @ts-ignore

import {
  DEFAULT_APP_DOMAIN,
  DEFAULT_IMAGE_PROFILE,
  IPFS_PROXY_URL
} from '../lib/config';
import { parse, setOptions } from 'marked';

import createDOMPurify from 'dompurify';
import omitDeep from 'omit-deep';

export const genericFetch = (url: string) =>
  fetch(url).then((response) =>
    response.ok
      ? response.json()
      : Promise.reject(new Error('Error HTTP: ' + response.status))
  );

export const prettyJSON = (message: string, obj: string) =>
  console.log(message, JSON.stringify(obj, null, 2));

export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const omit = (object: any, name: string) => omitDeep(object, [name]);

export const getIPFSImage = (url: string) => {
  if (!url?.includes('/')) {
    console.log(`${IPFS_PROXY_URL}${url}`);
    return `${IPFS_PROXY_URL}${url}`;
  } else {
    return url?.includes('ipfs://')
      ? url.replace('ipfs://', IPFS_PROXY_URL)
      : url;
  }
};

export const getBufferFromUpload = async (cover: File): Promise<any> => {
  let imageBuffer: Buffer | null;
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
      return resolve(imageBuffer);
    };
    reader.onerror = () => {
      return reject(reader.error);
    };
  });
};

export const imageToBase64 = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
  });
};

export function readFile(file: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => resolve(reader.result as string),
      false
    );
    reader.readAsDataURL(file);
  });
}

export const pickPicture = (elementPicture: any, defaultPNG: string) =>
  elementPicture?.__typename === 'MediaSet'
    ? elementPicture?.original.url
    : elementPicture?.__typename === 'NftImage'
    ? elementPicture.uri
    : defaultPNG;

export const findKeyAttributeInProfile = (
  lensProfile: any,
  key: string
): any => {
  if (lensProfile?.attributes && lensProfile?.attributes.length > 0) {
    const attributeObj = lensProfile?.attributes?.find(
      (obj: any) => obj.key === key // In most cases ATTRIBUTES_LIST_KEY
    );
    return attributeObj;
  }
  return false;
};

export enum PostProcessStatus {
  CREATING_LIST,
  COLLECTING_POST,
  ADDING_POST,
  INDEXING,
  FINISHED,
  ERROR_UNAUTHORIZED,
  IDLE
}

export const checkIfUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const markdownToHTML = (innerHtml: string): any => {
  const dirtyHTML = parse(innerHtml);
  const windowGlobal = typeof window !== 'undefined' && window;
  if (!windowGlobal) {
    throw new Error('it runs on client side only.');
  }
  const DOMPurify = createDOMPurify(windowGlobal);
  const cleanHTML = DOMPurify.sanitize(dirtyHTML);

  return { __html: cleanHTML };
};

export const validateWhitelist = async (address: string): Promise<boolean> => {
  const response = await fetch(`/api/gate?wallet=${address}`);
  const data = await response.json();
  console.log('validateWhitelist data: ', data);
  return data.isWhitelisted as boolean;
};

const getUrl = (media: any, defaultUrl: string) => {
  if (!media) {
    return;
  }
  return media?.__typename === 'MediaSet'
    ? media.original.url
    : media?.__typename === 'NftImage'
    ? media.uri
    : defaultUrl;
};

export const getPictureUrl = (lensProfile: any) => {
  return getUrl(lensProfile?.picture, DEFAULT_IMAGE_PROFILE);
};

export const getCoverPictureUrl = (lensProfile: any) => {
  return getUrl(lensProfile?.coverPicture, DEFAULT_IMAGE_PROFILE);
};

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const getEnvironmentFromDomain = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_DOMAIN;
  }
  const domain = window.location.origin;
  return `${domain}/app`;
};
