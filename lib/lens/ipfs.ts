import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';

// FIXME
const INFURA_PROJECT_ID = '2FtLXLpfvzpENl2Xm3K0ElHdGDc';
const INFURA_SECRET = '2ec4307c38429b097dd373c3b69b890b';
const projectId = INFURA_PROJECT_ID;
const secret = INFURA_SECRET;

if (!projectId || !secret) {
  throw new Error(
    'Must define INFURA_PROJECT_ID and INFURA_SECRET in the .env to run this'
  );
}

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(`${projectId}:${secret}`).toString(
      'base64'
    )}`
  }
});

export const uploadIpfs = async <T>(data: T) => {
  const result = await client.add(JSON.stringify(data));
  // console.log('upload result ipfs', result);
  return result;
};

export const uploadImageIpfs = async (data: Buffer) => {
  const result = await client.add(data);
  // console.log('image upload result ipfs', result);
  return result;
};
