import React, { FC } from 'react';

import Image from 'next/image';

interface Props {
  setIsVisibleWL: React.Dispatch<React.SetStateAction<boolean>>;
}

const WhitelistScreen: FC<Props> = ({ setIsVisibleWL }) => (
  <>
    <style jsx global>{`
      body {
        position: relative;
      }

      body::before,
      body::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.99);
        filter: blur(5px);
        pointer-events: none;
        z-index: 1;
      }

      main {
        z-index: 2;
        width: 104vw;
        position: relative;
        left: 53%;
        transform: translateX(-50%);
      }
    `}</style>
    <main
      className="flex h-full w-full flex-col items-center
      justify-center duration-1000 animate-in
      fade-in-50"
      style={{
        background: 'url(/img/whitelist-back.svg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <figure>
        <Image
          src="/img/landing/nata-logo.svg"
          alt="Nata Logo"
          width={205}
          height={52}
        />
      </figure>

      <section
        className="m-12 justify-center rounded-xl
     border border-solid border-gray-200
     bg-transparent p-10 text-center"
      >
        <figure className="flex w-full justify-center">
          <Image
            priority={true}
            alt="Person Illustration"
            width={242}
            height={242}
            src="/img/person_wl.svg"
          />
        </figure>

        <h2 className="mb-4 mt-10 font-serif text-4xl font-bold">
          You are not in the list!
        </h2>

        <section>
          <p className="mx-32 my-4  text-center font-serif text-sm">
            Grab your spot on the <b>Nata Social </b>
            waitlist and be one of the first people to use the platform! Soon,
            you will be able to login.
          </p>

          <a
            className="mb-3 flex justify-center"
            href="https://tally.so/r/mVjz7J"
            target="_blank"
            rel="noreferrer"
          >
            <button className="mb-3 rounded-full bg-black px-6 py-3 font-serif text-white">
              JOIN THE WAITLIST
            </button>
          </a>
        </section>
        <button
          className="mb-10 bg-transparent font-serif font-thin text-gray-600"
          onClick={() => setIsVisibleWL(false)}
        >
          Dismiss
        </button>
        <footer>
          <p className="font-serif font-bold">Yours, The Nata Social team.</p>
        </footer>
      </section>
    </main>
  </>
);

export default WhitelistScreen;
