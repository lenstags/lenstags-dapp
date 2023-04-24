import { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from 'env-config';

const { AUTH_OPENAI_APIKEY, AUTH_OPENAI_ORGANIZATION } = envConfig;

const openaiCredentials = {
  organization: AUTH_OPENAI_ORGANIZATION,
  apiKey: AUTH_OPENAI_APIKEY
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const imageUrl = req.query.imageUrl as string;
    const requestOptions = {
      headers: {
        Authorization: `Basic ${btoa(
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
