import type { NextApiRequest, NextApiResponse } from 'next';

const WHITELISTED_WALLETS = [
  '0x014FFCF34D8515535b99d6AEF654258c237168B6',
  '0xB405b3E6494CAc9a88660362Ee19C38E955E2C6E'
];

type ResponseData = {
  isWhitelisted: boolean;
};

const handler = (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { wallet } = req.query;

  if (typeof wallet !== 'string') {
    res.status(400).json({ isWhitelisted: false });
    return;
  }

  const isWhitelisted: boolean = WHITELISTED_WALLETS.includes(wallet);
  res.status(200).json({ isWhitelisted });
};

export default handler;
