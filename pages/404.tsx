import { ProfileContext, TagsFilterContext } from 'components';
import { disable, enable, queryProfile } from '@lib/lens/dispatcher';
import { useContext, useEffect, useState } from 'react';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import ExplorerCard from 'components/ExplorerCard';
import Head from 'next/head';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components/Layout';
import Link from 'next/link';
import type { NextPage } from 'next';
import Pagination from 'components/Pagination';
import { Spinner } from 'components/Spinner';
import { TagsFilter } from 'components/TagsFilter';
import { createDefaultList } from '@lib/lens/load-lists';
import { explore } from '@lib/lens/explore-publications';
import { useSnackbar } from 'material-ui-snackbar-provider';

const App: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [hydrationLoading, setHydrationLoading] = useState(true);
  useEffect(() => {
    setHydrationLoading(false);
  }, []);

  const { tags } = useContext(TagsFilterContext);
  const [showWelcome, setShowWelcome] = useState(false);
  const [ready, setReady] = useState(false);

  const snackbar = useSnackbar();
  // const lensProfile = useContext(ProfileContext);
  const { profile: lensProfile } = useContext(ProfileContext);

  useEffect(() => {
    const findDefault = async () => {
      const profileResult = await queryProfile({ profileId: lensProfile?.id });

      let defaultListId = profileResult?.attributes?.find(
        (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
      )?.value;
      // console.log('🎇🎇🎇 hay defaultListId?: ', defaultListId);

      const enableRelayer =
        profileResult && !profileResult.dispatcher?.canUseRelay;

      if (enableRelayer || !defaultListId) {
        setShowWelcome(true);

        if (enableRelayer) {
          snackbar.showMessage('🟦 Enabling Tx Dispatcher...');
          await enable(profileResult.id);
          snackbar.showMessage('🟦 Dispatcher enabled successfully.');
        }

        if (!defaultListId) {
          snackbar.showMessage('🟦 Creating default list...');
          await createDefaultList(profileResult);
          snackbar.showMessage('💚 LFGrow ⚜️!');
        }
        setReady(true);
      }
    };

    // FIXME THIS MUST BE STORED ON LOCALSTORAGE
    if (lensProfile?.id) {
      // console.log('🔆 Verifying first connection');
      findDefault();
    }
  }, [lensProfile]);

  useEffect(() => {
    explore({ locale: 'en', tags }).then((data) => {
      return setPublications(data.items);
    });
  }, [tags]);

  if (hydrationLoading) {
    return (
      <div className="flex">
        <div className="my-8 justify-center">
          <Spinner h="10" w="10" />
        </div>
      </div>
    );
  }

  const handleWelcomeClick = () => {
    setShowWelcome(false);
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mb-8 mt-4 font-serif text-2xl">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link
          className="rounded-full bg-white px-6 py-2 font-sans text-2xl text-green-500"
          href="/"
        >
          Volver al inicio
        </Link>
      </div>
    </>
  );
};
<style jsx>{`
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`}</style>;

export default App;
