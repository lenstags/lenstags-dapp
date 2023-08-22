import Image from 'next/image';
import React from 'react';

const WhitelistScreen = () => (
  <div
    className="flex h-full w-full items-center justify-center "
    style={{
      background: 'url(/img/whitelist-back.svg)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }}
  >
    <div>
      <div className="mb-10 text-center font-serif text-2xl font-bold">
        You are not in the list!
      </div>
      <div className="mb-10 text-center font-serif text-2xl font-bold">
        <p>Soon, you&apos;ll be able to login</p>
      </div>

      <div className="flex justify-center">
        <Image
          className="  "
          // category="profile"
          src="/img/landing/nata-logo.svg"
          alt=""
          width={150}
          height={40}
        />
      </div>
    </div>
  </div>
);

export default WhitelistScreen;
