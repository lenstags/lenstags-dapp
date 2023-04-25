import React, { useEffect, useState } from 'react';

const DISMISS_TIMEOUT = 5000;

interface ToastProps {
  text: string;
  level: string;
}

const Toast: React.FC<ToastProps> = ({ text, level }) => {
  const [isDismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDismissed(true), DISMISS_TIMEOUT);
    return () => clearTimeout(timeoutId);
  }, [DISMISS_TIMEOUT]);

  if (isDismissed) return null;

  return (
    <div className="bg-lensSucess fixed px-2 py-4 font-light text-lg text-black text-center rounded-lg bottom-4 right-8 m-auto w-80 z-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-ad-2 float-left"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M11.933 5h-6.933v16h13v-8"></path>
        <path d="M14 17h-5"></path>
        <path d="M9 13h5v-4h-5z"></path>
        <path d="M15 5v-2"></path>
        <path d="M18 6l2 -2"></path>
        <path d="M19 9h2"></path>
      </svg>

      <span className="mr-2 m- ">{text}</span>
      <button
        className="text-black bg-transparent p-1 rounded-lg float-right"
        onClick={() => setDismissed(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-x"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default Toast;
