import { APP_UI_VERSION, DEFAULT_NETWORK } from '@lib/config';
import React, { FC } from 'react';

import ImageProxied from './ImageProxied';
import { Spinner } from './Spinner';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import { useDisconnect } from 'wagmi';
import useHandleSetup from '@lib/hooks/useHandleSetup';

interface Props {
  chain: any;
  welcomeReady: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  lensProfile: any;
}

const WhitelistScreen: FC<Props> = ({
  chain,
  lensProfile
  //   welcomeReady,
  //   setShowWelcome
}) => {
  const {
    showWelcome,
    setShowWelcome,
    setShowReject,
    showReject,
    welcomeReady,
    handleSetup
  } = useHandleSetup(lensProfile);
  const { disconnect } = useDisconnect();

  return (
    <div
      className=" duration-600 fixed 
          bottom-0 
          left-0 right-0
          top-0 z-50 flex h-full w-full flex-col items-center  justify-center bg-stone-900
          "
      style={{
        backgroundImage: 'linear-gradient(to bottom, gray, rgb(45 212 191))',
        backgroundSize: '400% 400%',
        animation: 'gradient 10s ease infinite'
      }}
    >
      <div className="mt-10 font-mono">
        {chain && (
          <div>
            Connected to {chain.name}-{chain.id}
          </div>
        )}
      </div>
      <ImageProxied
        className="mt-20"
        category="profile"
        src="/img/landing/nata-logo.svg"
        alt=""
        width={200}
        height={120}
      />
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
      <div className="  h-full w-2/3 max-w-xl content-center items-center justify-center py-20 text-center font-mono">
        <p className=" mb-6 text-center font-sans text-4xl ">Welcome!</p>
        <p className="py-6 text-justify font-serif text-lg">
          This platform is an <b>Beta</b> release
          <i> (fresh out of the oven)</i>, meaning that some unexpected
          behaviour may occur. We appreciate your understanding and encourage
          you to report any issues you encounter.
        </p>

        <p className="py-4">Yours, The Nata Social team ⚜️</p>

        <p className="pb-4 text-xs">
          P.S.: Meanwhile, we are performing some setup tasks in background,
          fasten your seat belts! 🚀
        </p>

        {welcomeReady ? (
          <div>
            <button
              className=" bg-black px-4 py-2 font-serif text-white hover:bg-gray-700"
              onClick={() => setShowWelcome(false)}
            >
              Continue
            </button>
          </div>
        ) : (
          !showReject && (
            <div className="flex justify-center">
              <Spinner h="8" w="8" />
            </div>
          )
        )}

        {showReject && (
          <div className="mt-6 rounded-lg border border-black px-8 py-4 text-center font-sans  ">
            <h1 className="py-2">⛔️ Oops!</h1>
            <h2>Seems that you rejected your wallet signature petitions.</h2>
            <br></br>
            <div className=" text-justify">
              In order to finish your account setup, we encourage to sign the
              following two wallet interactions:
              <p>- The dispatcher signature: sets you free from signing TX!</p>
              <p>
                - The default saved items list: the main folder where you will
                store your posts.
              </p>
            </div>

            <div className="my-4 flex justify-between">
              <button
                onClick={() => {
                  setShowReject(false);

                  handleSetup();
                }}
                className="rounded-lg bg-black px-6 py-1 text-white"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  deleteLensLocalStorage();
                  disconnect();
                  setShowReject(false);
                  setShowWelcome(false);
                }}
                className="rounded-lg  border border-solid border-black 
                      bg-transparent px-6 py-1"
              >
                Cancel, navigate without registering
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-10">
        <hr />
        <div className="font-mono text-xs">
          ui v{APP_UI_VERSION} - {DEFAULT_NETWORK}
        </div>
      </div>
    </div>
  );
};

export default WhitelistScreen;
