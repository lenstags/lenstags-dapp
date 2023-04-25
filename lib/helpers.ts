// @ts-ignore

import { IPFS_PROXY_URL } from './config';
import omitDeep from 'omit-deep';

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
