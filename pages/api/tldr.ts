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
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `give a short description in a single statement about this: '${text}' `,
      temperature: 0.7,
      max_tokens: 15,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 1.0
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
    return res.status(500).json({
      status: 'error',
      message: error.message,
      data: null
    });
  }
}
