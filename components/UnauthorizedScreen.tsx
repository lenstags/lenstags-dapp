import { useConnectModal } from "@rainbow-me/rainbowkit";

const UnauthorizedScreen = () => {

  const { openConnectModal } = useConnectModal();

  return (
    <div
      className="hero min-h-screen"
      style={{ backgroundImage: `url("https://mirror-media.imgix.net/publication-images/3Itv7noSV5TxYX_29IYhA.png?h=2500&w=2500")` }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Welcome to Lenstags</h1>
          <p className="mb-5">
            Please sign in with your wallet
          </p>
          <button className="btn btn-primary" onClick={openConnectModal}>Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedScreen;
