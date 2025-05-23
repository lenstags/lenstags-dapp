import {
  TypedDataDomain,
  TypedDataField
} from '@ethersproject/abstract-signer';
import { ethers, utils } from 'ethers';

import { omit } from '../../utils/helpers';

// getSigner function from injected web3 provider
export const getSigner = () => {
  if (typeof window === 'undefined') {
    // const privateKey: any = process.env.PRIVATE_KEY;
    // const provider = new ethers.providers.JsonRpcProvider(
    //   MUM BAI_RPC_URL
    //   // process.env.POLYGON_RPC
    // );
    // const singer = new ethers.Wallet(privateKey, provider);
    // return singer;
  } else {
    // client side
    // @ts-ignore
    const p: any = window.ethereum;
    if (typeof p === 'undefined') {
      return undefined; // no-provider;
    }
    const provider = new ethers.providers.Web3Provider(p);
    return provider.getSigner();
  }
};

export const getAddressFromSigner = async () => {
  return await getSigner()?.getAddress();
};

export const signedTypeData = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
) => {
  const signer = getSigner();
  // remove the __typedname from the signature!
  return signer?._signTypedData(
    // FIXME
    omit(domain, '__typename'),
    // @ts-ignore
    omit(types, '__typename'),
    omit(value, '__typename')
  );
};

export const splitSignature = (signature: string) => {
  return utils.splitSignature(signature);
};

export const sendTx = (
  transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
) => {
  const signer = getSigner();
  return signer?.sendTransaction(transaction);
};

export const signText = (text: string) => {
  return getSigner()?.signMessage(text);
};
