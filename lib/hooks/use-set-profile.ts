import { useCreateSetProfileMetadataTypedDataMutation } from '@lib/lens/graphql/generated';
import { useEffect, useState } from 'react';
import { ProfileMetadata } from '@lib/lens/interfaces/profile-metadata'; //'types/profile-metadata'
import { signedTypeData, splitSignature } from '@lib/lens/ethers.service';
import { uploadIpfs } from '@lib/lens/ipfs';
import { getLensPeriphery } from '@lib/lens/lens-hub';
// import { useAuth } from './use-auth';
import { useIndexedTx } from './use-indexed-tx';
import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';

export const useSetProfileMetadata = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //   const { auth: login } = useAuth();
  const [txHash, setTxHash] = useState(null);
  const { tx, error: indexError } = useIndexedTx(txHash); // use this for more control?

  const [createSetProfileMetadataTypedDataMutation] =
    useCreateSetProfileMetadataTypedDataMutation();

  const setProfileMetadata = async (
    profileId: string,
    metadata: ProfileMetadata
  ) => {
    try {
      setLoading(true);
      //   const address = await getAddressFromSigner();
      //   await login(address);
      const ipfsResult = await uploadIpfs<ProfileMetadata>(metadata);
      const createProfileMetadataRequest = {
        profileId,
        metadata: 'ipfs://' + ipfsResult.path
      };
      const result = await createSetProfileMetadataTypedDataMutation({
        variables: {
          request: createProfileMetadataRequest
        }
      });

      console.log('create profile metadata: createCommentTypedData', result);

      const typedData =
        result.data!.createSetProfileMetadataTypedData.typedData;
      console.log('create profile metadata: typedData', typedData);

      const signature = await signedTypeData(
        typedData.domain,
        typedData.types as any,
        typedData.value
      );
      console.log('create profile metadata: signature', signature);

      if (!signature) {
        throw new Error('Error splitting signature');
      }

      const { v, r, s } = splitSignature(signature);

      const tx = await getLensPeriphery().setProfileMetadataURIWithSig({
        profileId: createProfileMetadataRequest.profileId,
        metadata: createProfileMetadataRequest.metadata,
        sig: {
          v,
          r,
          s,
          deadline: typedData.value.deadline
        }
      });
      console.log('create profile metadata: tx hash', tx.hash);
      setTxHash(tx.hash);
    } catch (e: any) {
      setError(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (txHash && tx) {
      setLoading(false);
    }
  }, [txHash, tx]);

  return {
    setProfileMetadata,
    loading
    // , tx, loading, error: error || indexError
  };
};
