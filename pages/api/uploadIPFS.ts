import { NextApiRequest, NextApiResponse } from 'next';

import { create } from 'ipfs-http-client';
import { envConfig } from '@lib/config';

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${envConfig.INFURA_PROJECT_ID}:${envConfig.INFURA_SECRET}`
    ).toString('base64')}`
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, isImage } = req.body;
    const newData = isImage ? data : JSON.stringify(data);
    const result = await client.add(newData);
    console.log('upload result ipfs', result);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error aca ', error);
    res.status(500).json({ error });
  }
}
