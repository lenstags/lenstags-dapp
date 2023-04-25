import { Configuration, OpenAIApi } from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from '@lib/config';

type Data = {
  message: string;
  status: string;
  data: any;
};

const { AUTH_OPENAI_APIKEY, AUTH_OPENAI_ORGANIZATION } = envConfig;
const configuration = new Configuration({
  organization: AUTH_OPENAI_ORGANIZATION,
  apiKey: AUTH_OPENAI_APIKEY
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { text } = req.query;
  try {
    const response = await openai.createImage({
      prompt: text as string,
      n: 1,
      size: '256x256',
      response_format: 'b64_json'
    });
    if (response.status !== 200) {
      return res.status(response.status).json({
        status: 'unknown',
        message: response.statusText,
        data: null
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Request processed successfully.',
      data: response.data
    });
  } catch (error: any) {
    {
      return res.status(500).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
  }
}
