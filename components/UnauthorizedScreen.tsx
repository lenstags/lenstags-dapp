import { useConnectModal } from "@rainbow-me/rainbowkit";

const UnauthorizedScreen = () => {

  const { openConnectModal } = useConnectModal();

  return (
    <div
      className="hero min-h-screen bg-black">
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl text-white font-bold">Welcome to</h1>
          <img src="img/logo-extended-white.svg"></img>
          <p className="mb-5">
            Please sign in with your wallet
          </p>
          <button  onClick={openConnectModal} className="btn rounded-full gap-1 bg-greenLenstags text-black  border-none hover:bg-greenLenstags">
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-login" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
          <path d="M20 12h-13l3 -3m0 6l-3 -3" />
          </svg>
          Sign In
          </button>

        </div>
      </div>
    </div>
  );
};

export default UnauthorizedScreen;
