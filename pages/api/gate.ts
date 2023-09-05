import type { NextApiRequest, NextApiResponse } from 'next';

import { NETWORKS } from '@lib/config';

const WHITELISTED_WALLETS = [
  '0x9D9bdFD17add8eFdDDaBE91EF94fA35F5Ad92313',
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

  const isWhitelisted: boolean = NETWORKS.TESTNET
    ? true
    : WHITELISTED_WALLETS.includes(wallet);
  res.status(200).json({ isWhitelisted });
};

export default handler;
