import { APP_UI_VERSION, DEFAULT_NETWORK } from '@lib/config';
import React, { FC, useState } from 'react';

import Image from 'next/image';
import { Spinner } from './Spinner';
import useDisconnector from '@lib/hooks/useDisconnector';

// import useHandleSetup from '@lib/hooks/useHandleSetup';

interface Props {
  chain: any;
  welcomeReady: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
}

const WhitelistScreen: FC<Props> = ({
  chain,
  welcomeReady,
  setShowWelcome
}) => {
  const { handleDisconnect } = useDisconnector();
  const [showHelp, setShowHelp] = useState(false);
  const [showReject, setShowReject] = useState(false);
  // const {
  //   // setShowWelcome,
  //   setShowReject,
  //   showReject,
  //   // welcomeReady,
  //   handleSetup
  // } = useHandleSetup(lensProfile);

  return (
    <section
      className="duration-600 fixed bottom-0 left-0
          right-0 
          top-0 z-50
          flex h-full w-full flex-col items-center justify-center bg-yellow-200 font-serif
          "
      style={{
        backgroundImage:
          'linear-gradient(45deg, white, #B0FCE6, white, #F58FA1)',
        backgroundSize: '400% 400%',
        animation: 'gradient 10s ease infinite'
      }}
    >
      {chain && (
        <p className="py-8 text-base tracking-widest">
          Connected to {chain.name}-{chain.id}
        </p>
      )}

      <main
        className="flex flex-col items-center justify-center rounded-xl border border-solid
       border-gray-400 bg-white bg-opacity-30 pt-8"
      >
        <Image
          className=""
          src="/img/person_welcome.svg"
          alt=""
          width={242}
          height={242}
        />

        <p className=" text-center text-5xl font-bold ">Welcome!</p>

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
        <div className="h-full max-w-3xl content-center items-center justify-center p-10 text-center">
          <p className="text-lg">
            This platform is a <b>Beta</b> release
            <i> (fresh out of the oven)</i>, meaning that some unexpected
            behaviour may occur. We appreciate your understanding and encourage
            you to report any issues you may encounter.
          </p>

          <p className="py-4 text-lg font-bold">
            Yours, The Nata Social team <span className="text-lg">⚜️</span>
          </p>

          <p className="pb-4 text-xs">
            P.S.: Meanwhile, we are performing some setup tasks in background,
            fasten your seat belts!{' '}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-transparent"
            >
              <svg
                width="14"
                height="13"
                viewBox="0 0 14 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.5 6L6.52766 5.98617C6.90974 5.79513 7.33994 6.14023 7.23634 6.55465L6.76366 8.44535C6.66006 8.85977 7.09026 9.20487 7.47234 9.01383L7.5 9M13 6.5C13 9.81371 10.3137 12.5 7 12.5C3.68629 12.5 1 9.81371 1 6.5C1 3.18629 3.68629 0.5 7 0.5C10.3137 0.5 13 3.18629 13 6.5ZM7 4H7.005V4.005H7V4Z"
                  stroke="#0F172A"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </p>
          {showHelp && (
            <div className="mx-24 flex flex-col justify-center rounded-md bg-black p-4 text-center font-sans text-white">
              <p className="mb-2 text-base">
                The last-minute modifications are being made
              </p>
              <p className="text-xs">
                We are activating the dispatcher to make it simpler for you to
                browse the platform and building a private default list so that
                you have it right away.
              </p>
            </div>
          )}

          {welcomeReady ? (
            <div>
              <button
                className=" bg-black px-4 py-2 text-white hover:bg-gray-700"
                onClick={() => setShowWelcome(false)}
              >
                Continue
              </button>
            </div>
          ) : (
            !showReject && (
              <div className=" mt-4 flex justify-center">
                <Spinner h="8" w="8" />
              </div>
            )
          )}

          {showReject && (
            <div className="mt-2 rounded-lg border border-black px-8 py-2 text-center">
              <div className="flex items-baseline justify-center">
                <h3 className="py-1">
                  ⛔️ Seems that you rejected the wallet signature petition
                </h3>
              </div>

              <div className="mx-20 pb-2 text-xs">
                In order to finish your account setup, we encourage to sign the
                dispatcher petition, it will allows you to make gasless
                transactions!
              </div>

              <div className=" flex justify-between">
                <button
                  onClick={() => {
                    setShowReject(false);
                    // handleSetup();
                  }}
                  className="rounded-lg bg-black px-6 py-1 text-white"
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    setShowReject(false);
                    setShowWelcome(false);
                    console.log('termine');
                    handleDisconnect();
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
      </main>

      <div className="pt-4 font-mono text-xs text-gray-500">
        ui v{APP_UI_VERSION} - {DEFAULT_NETWORK}
      </div>
    </section>
  );
};

export default WhitelistScreen;
