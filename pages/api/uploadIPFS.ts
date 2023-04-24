import { NextApiRequest, NextApiResponse } from 'next';

import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { envConfig } from '@lib/config';

const projectId = envConfig.INFURA_PROJECT_ID;
const secret = envConfig.INFURA_SECRET;

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, isImage } = req.body;

  try {
    let result;
    if (isImage) {
      result = await client.add(data);
    } else {
      result = await client.add(JSON.stringify(data));
    }
    console.log('upload result ipfs', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error aca ', error);
    res.status(500).json({ error: error });
  }
}
