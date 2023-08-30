import type { NextApiRequest, NextApiResponse } from 'next';

import { NETWORKS } from '@lib/config';

const WHITELISTED_WALLETS = ['0x014FFCF34D8515535b99d6AEF654258c237168B6', '0xeB53C577B5bC45F9f7A08aae188bCE6fc38f02f0', '0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3'];

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
