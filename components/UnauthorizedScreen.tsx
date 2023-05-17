import { useConnectModal } from '@rainbow-me/rainbowkit';

export const UnauthorizedScreen = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="hero flex min-h-screen items-center justify-center ">
      <div className="hero-overlay  bg-opacity-60"></div>
      <div className="hero-content  text-neutral-content text-center">
        <div className="flex max-w-md flex-col justify-center text-center ">
          <p className=" font-sans text-2xl font-bold">Welcome to</p>
          <img className="my-8" src="img/landing/nata-logo.svg" />
          <p className=" my-4 mb-5 font-sans text-gray-400">
            Please sign in with your wallet
          </p>
          <div className="flex justify-center">
            <button
              onClick={openConnectModal}
              className="flex items-center gap-1 rounded-full border-none bg-teal-200
               px-6 py-2 font-serif text-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-login"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#000"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M20 12h-13l3 -3m0 6l-3 -3" />
              </svg>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
