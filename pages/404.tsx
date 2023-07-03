import Link from 'next/link';
import type { NextPage } from 'next';

const App: NextPage = () => {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-teal-400 to-black text-white">
        <h1 className="text-6xl font-bold">404 🦗🦗</h1>
        <p className="mb-8 mt-4 font-serif text-2xl">
          The place you tried to go, realn`t...
        </p>
        <Link
          className="rounded-lg  bg-black px-6 py-2 font-sans text-2xl text-white "
          href="/"
        >
          Back to home
        </Link>
      </div>
    </>
  );
};

export default App;
