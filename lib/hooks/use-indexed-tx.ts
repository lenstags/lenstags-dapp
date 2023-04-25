import { useHasTxHashBeenIndexedLazyQuery } from '@lib/lens/graphql/generated';
import { useCallback, useEffect, useState } from 'react';
import { sleep } from '@lib/helpers';
// import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';

export function useIndexedTx(txHash: string | null) {
  const [tx, setTx] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasTxHashBeenIndexedQuery] = useHasTxHashBeenIndexedLazyQuery();

  const pollUntilIndexed = useCallback(
    async (txHash: string) => {
      if (!txHash) {
        return;
      }
      while (true) {
        const result = await hasTxHashBeenIndexedQuery({
          variables: {
            request: {
              txHash
            }
          },
          fetchPolicy: 'network-only'
        });
        console.log(
          'polling for tx',
          txHash,
          result.data?.hasTxHashBeenIndexed
        );
        const response = result.data?.hasTxHashBeenIndexed;
        if (response?.__typename === 'TransactionIndexedResult') {
          if (response.metadataStatus) {
            console.log(
              '@@@@@@@@ response.metadataStatus: ',
              response.metadataStatus
            );
            if (response.metadataStatus.status === 'SUCCESS') {
              setTx(response.txReceipt);
              return response.txReceipt;
            }
            if (
              response.metadataStatus.status === 'METADATA_VALIDATION_FAILED'
            ) {
              setError(
                new Error(
                  response.metadataStatus.reason || 'Metadata validation failed'
                )
              );
              setTx(response?.txReceipt);
              return response.txReceipt;
            }
          } else {
            if (response.indexed) {
              setTx(response.txReceipt);
              return response.txReceipt;
            }
          }
          await sleep(1500);
        } else {
          setError(new Error(response?.reason));
        }
      }
    },
    [hasTxHashBeenIndexedQuery]
  );

  useEffect(() => {
    if (txHash) {
      pollUntilIndexed(txHash);
    }
  }, [pollUntilIndexed, txHash]);
  // }, [txHash]);

  return { tx, error };
}
