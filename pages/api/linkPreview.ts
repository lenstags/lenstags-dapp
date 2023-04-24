import { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from '@lib/config';

type Data = {
  message: string;
  status: string;
  data: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { AUTH_LINKPREVIEW_KEY } = envConfig;
  const { url } = req.query;
  const fetchUrl = `https://api.linkpreview.net/?key=${AUTH_LINKPREVIEW_KEY}&q=${url}`;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return res.status(500).json({
        status: 'error',
        message: 'LinkPreview API returned an error.',
        data: null
      });
    }

    const data = await response.json();
    return res.status(200).json({
      status: 'success',
      message: 'Request processed successfully.',
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      data: null
    });
  }
}
