import { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from 'env-config';
import fs from 'fs';
import path from 'path';

const { AUTH_OPENAI_APIKEY, AUTH_OPENAI_ORGANIZATION } = envConfig;

const openaiCredentials = {
  organization: AUTH_OPENAI_ORGANIZATION,
  apiKey: AUTH_OPENAI_APIKEY
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let imageUrl = req.query.imageUrl as string;

    if (!imageUrl) {
      const defaultFilePath = path.join(
        process.cwd(),
        'public',
        'img',
        'post.png'
      );
      const defaultFileData = fs.readFileSync(defaultFilePath);
      return res.send(defaultFileData);
    }

    const requestOptions = {
      headers: {
        Authorization: `Basic ${btoa(
          // FIXME BTOA
          `${openaiCredentials.organization}:${openaiCredentials.apiKey}`
        )}`
      }
    };

    const response = await fetch(imageUrl, requestOptions);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.log('ERR! ', err);
  }
}

export default handler;
