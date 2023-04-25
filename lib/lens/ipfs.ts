import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';

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
  console.log(
    `Basic ${Buffer.from(`${projectId}:${secret}`).toString('base64')}`
  );
  const result = await client.add(JSON.stringify(data));
  console.log('upload result ipfs', result);
  return result;
};

export const uploadImageIpfs = async (data: Buffer) => {
  const result = await client.add(data);
  console.log('image upload result ipfs', result);
  return result;
};

// FIXME ALL THIS MUST BE DONE

// import { Buffer } from 'buffer';

// export const uploadIpfsold = async <T>(data: T) => {
//   const result = await client.add(JSON.stringify(data));
//   console.log('upload result ipfs', result);
//   return result;
// };

// export const uploadIpfs = async <T>(data: T) => {
//   console.log('dataaa ', data);

//   const formData = new FormData();
//   const json = JSON.stringify(data);
//   const blob = new Blob([json], { type: 'application/json' });
//   formData.append('data', blob);
//   formData.append(
//     'isImage',
//     new Blob(['false'], { type: 'application/octet-stream' })
//   );

//   try {
//     const response = await fetch('/api/uploadIPFS', {
//       method: 'POST',
//       body: formData,
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });

//     const responseData = await response.json();
//     console.log('responseData!!! ', responseData);
//     return responseData;
//   } catch (error) {
//     console.error('AXAAA !', error);
//   }
// };

// export const uploadImageIpfs = async (file: Buffer) => {
//   console.log('BUFF 2', file);

//   const formData = new FormData();
//   formData.append(
//     'data',
//     new Blob([file], { type: 'image/jpeg' }),
//     'file.jpeg'
//   );
//   formData.append('isImage', 'true');

//   try {
//     const response = await fetch('/api/uploadIPFS', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json();
//     console.log('image upload result ipfs', data);
//     return data;
//   } catch (error) {
//     console.error(error);
//   }
// };
