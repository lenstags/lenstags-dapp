import { useContext, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { ProfileContext } from './LensAuthenticationProvider';
import { deleteLensLocalStorage } from 'lib/lens/localStorage';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';

interface SidebarProps {
  position: 'left' | 'right';
}

const Sidebar: React.FC<SidebarProps> = ({ position }) => {
  const { openConnectModal } = useConnectModal();
  const { profile: lensProfile } = useContext(ProfileContext);
  const [profileView, setProfileView] = useState(false);
  // const { profile, setProfile } = useContext(ProfileContext);
  // const [profile, setProfile] = useState(false);
  const { disconnect } = useDisconnect();
  const handleDisconnect = () => {
    deleteLensLocalStorage();
    disconnect();
  };

  const pictureUrl =
    lensProfile?.picture?.__typename === 'MediaSet'
      ? lensProfile?.picture.original.url
      : lensProfile?.picture?.__typename === 'NftImage'
      ? lensProfile?.picture.uri
      : '/img/profilePic.png';

  return (
    <div
      style={{
        ...(position === 'right' ? { width: '24.3333%' } : {})
      }}
      className={`fixed h-screen ${
        position === 'left'
          ? 'left-0 w-2/12 bg-stone-100 py-6 '
          : 'right-0  bg-red-300 '
      } `}
    >
      {position === 'left' ? (
        <>
          <div className="px-6 pb-4">
            <Link href={'/'}>
              <Image
                className=" cursor-pointer  "
                // category="profile"
                src="/img/landing/nata-logo.svg"
                alt=""
                width="150px"
                height="40px"
              />
            </Link>
          </div>
          {/* menu items */}
          <div className="font-serif text-base">
            <div
              className="flex h-12 items-center gap-1 border-l-4 border-l-teal-400
             bg-white px-6 font-bold
             
             "
            >
              <svg
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.25 11.0028L10.2045 2.04826C10.6438 1.60892 11.3562 1.60891 11.7955 2.04825L20.75 11.0028M3.5 8.75276V18.8778C3.5 19.4991 4.00368 20.0028 4.625 20.0028H8.75V15.1278C8.75 14.5064 9.25368 14.0028 9.875 14.0028H12.125C12.7463 14.0028 13.25 14.5064 13.25 15.1278V20.0028H17.375C17.9963 20.0028 18.5 19.4991 18.5 18.8778V8.75276M7.25 20.0028H15.5"
                  stroke="#121212"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span className="ml-2">Home</span>
            </div>

            <div
              className="flex h-12 items-center  gap-1
             px-6"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 19C14.1926 19 17.7156 16.1332 18.7157 12.2529M10 19C5.80742 19 2.28442 16.1332 1.2843 12.2529M10 19C12.4853 19 14.5 14.9706 14.5 10C14.5 5.02944 12.4853 1 10 1M10 19C7.51472 19 5.5 14.9706 5.5 10C5.5 5.02944 7.51472 1 10 1M10 1C13.3652 1 16.299 2.84694 17.8431 5.58245M10 1C6.63481 1 3.70099 2.84694 2.15692 5.58245M17.8431 5.58245C15.7397 7.40039 12.9983 8.5 10 8.5C7.00172 8.5 4.26027 7.40039 2.15692 5.58245M17.8431 5.58245C18.5797 6.88743 19 8.39463 19 10C19 10.778 18.9013 11.5329 18.7157 12.2529M18.7157 12.2529C16.1334 13.6847 13.1619 14.5 10 14.5C6.8381 14.5 3.86662 13.6847 1.2843 12.2529M1.2843 12.2529C1.09871 11.5329 1 10.778 1 10C1 8.39463 1.42032 6.88743 2.15692 5.58245"
                  stroke="#121212"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span className="ml-2">Explore</span>
            </div>

            <div
              className="flex  h-12 items-center  gap-1
             px-6"
            >
              <svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.0625 9.6875V9C1.0625 7.86091 1.98591 6.9375 3.125 6.9375H16.875C18.0141 6.9375 18.9375 7.86091 18.9375 9V9.6875M10.9723 3.78477L9.02773 1.84023C8.76987 1.58237 8.42013 1.4375 8.05546 1.4375H3.125C1.98591 1.4375 1.0625 2.36091 1.0625 3.5V14.5C1.0625 15.6391 1.98591 16.5625 3.125 16.5625H16.875C18.0141 16.5625 18.9375 15.6391 18.9375 14.5V6.25C18.9375 5.11091 18.0141 4.1875 16.875 4.1875H11.9445C11.5799 4.1875 11.2301 4.04263 10.9723 3.78477Z"
                  stroke="#121212"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span className="ml-2">My inventory</span>
            </div>

            <div
              className="flex  h-12 items-center gap-1
             px-6"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.8574 15.0817C14.752 14.857 16.5789 14.4116 18.3117 13.7719C16.8749 12.177 16.0004 10.0656 16.0004 7.75V7.04919C16.0005 7.03281 16.0006 7.01641 16.0006 7C16.0006 3.68629 13.3143 1 10.0006 1C6.68685 1 4.00056 3.68629 4.00056 7L4.00036 7.75C4.00036 10.0656 3.12584 12.177 1.68904 13.7719C3.42197 14.4116 5.249 14.857 7.1437 15.0818M12.8574 15.0817C11.9205 15.1928 10.9671 15.25 10.0004 15.25C9.03373 15.25 8.08044 15.1929 7.1437 15.0818M12.8574 15.0817C12.9504 15.3711 13.0006 15.6797 13.0006 16C13.0006 17.6569 11.6574 19 10.0006 19C8.34371 19 7.00056 17.6569 7.00056 16C7.00056 15.6797 7.05075 15.3712 7.1437 15.0818M1.125 5.5C1.41228 3.78764 2.18309 2.23924 3.29224 1M16.7089 1C17.818 2.23924 18.5888 3.78764 18.8761 5.5"
                  stroke="#121212"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span className="ml-2">Notifications</span>
            </div>
          </div>

          <div className="   flex px-6 pt-4  text-white">
            <button className=" w-full  rounded-lg px-4 py-2 align-middle text-white">
              <Link href={'/create'}>+ CREATE</Link>
            </button>
          </div>
        </>
      ) : (
        <div className="py-6 pr-4">
          <div className="  bg-white pb-6 text-right ">
            {lensProfile ? (
              <>
                <button
                  style={{ height: '40px' }}
                  onClick={() => setProfileView(!profileView)}
                  className="rounded-lg border border-solid border-stone-500 bg-transparent p-1 align-middle"
                >
                  <div className="flex items-center">
                    <img
                      className="mx-1 h-7 w-7 rounded-full"
                      src={pictureUrl}
                      alt="avatar"
                    />
                    <div>@{lensProfile?.handle}</div>
                  </div>
                </button>

                {/* menu */}
                {profileView && (
                  <ul className=" absolute rounded border-r bg-white font-extralight text-black shadow">
                    <li className="flex w-full cursor-pointer justify-between border-b px-5 py-3 ">
                      <div className="fl first-letter:ex">
                        <Link
                          href={'/my-profile'}
                          className="ml-2 hover:font-bold "
                        >
                          <p>
                            <p className="text-xs font-thin text-stone-400">
                              Connected as
                            </p>
                            <span className=" text-green-500">@</span>
                            <span className=" text-green-700">
                              {lensProfile?.handle}
                            </span>
                          </p>
                        </Link>
                      </div>
                    </li>
                    <li className="items-left flex w-full cursor-pointer border-b px-5 py-3">
                      <div className="float-left flex items-center text-left">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-user mr-2 hover:text-red-600"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <circle cx={12} cy={7} r={4} />
                          <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                        </svg>
                        <Link
                          href={'/my-profile'}
                          className="ml-2 hover:font-bold "
                        >
                          My profile
                        </Link>
                      </div>
                    </li>
                    <li className="items-left flex w-full cursor-pointer border-b px-5 py-3">
                      <div className="float-left flex items-center text-left">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="mr-1 h-6 w-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <Link href={'/settings'} className=" hover:font-bold ">
                          Settings
                        </Link>
                      </div>
                    </li>
                    <li className="flex w-full cursor-pointer items-center justify-between border-b px-5 py-3 hover:text-red-600">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-logout"
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                          <path d="M7 12h14l-3 -3m0 6l3 -3" />
                        </svg>
                        <span
                          className="ml-2 hover:text-red-600"
                          onClick={handleDisconnect}
                        >
                          Disconnect
                        </span>
                      </div>
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <button
                onClick={openConnectModal}
                className="  rounded-lg 
          p-2 align-middle font-serif font-medium tracking-wider text-white
          "
              >
                ✦ CONNECT
              </button>
            )}
          </div>

          {/* profiles */}
          <div className="mb-6 rounded-lg bg-stone-100 py-6 pr-4 ">
            <div className="mb-4 rounded-lg  pl-4">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 13C15.4292 13 19.8479 17.3267 19.9962 22.7201L20 23H18C18 18.5817 14.4183 15 10 15C5.66509 15 2.13546 18.4478 2.00381 22.7508L2 23H0C0 17.4772 4.47715 13 10 13ZM10 0C13.3137 0 16 2.68629 16 6C16 9.31371 13.3137 12 10 12C6.68629 12 4 9.31371 4 6C4 2.68629 6.68629 0 10 0ZM10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2Z"
                    fill="#4A4A4A"
                  />
                </svg>
                Recommended profiles
              </div>
              {/* <div className="mt-4">
                <p>item1</p>
                <p>item1</p>
                <p>item1</p>
                <p>item1</p>
              </div> */}
            </div>
          </div>
          <div className="rounded-lg bg-stone-100 px-4 py-6 ">
            {/* recommended lists */}
            <div className=" mb-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 22 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 14C3.55228 14 4 14.4477 4 15V17C4 17.5523 3.55228 18 3 18H1C0.447715 18 0 17.5523 0 17V15C0 14.4477 0.447715 14 1 14H3ZM21 15C21.5523 15 22 15.4477 22 16C22 16.5523 21.5523 17 21 17H7C6.44772 17 6 16.5523 6 16C6 15.4477 6.44772 15 7 15H21ZM3 7C3.55228 7 4 7.44772 4 8V10C4 10.5523 3.55228 11 3 11H1C0.447715 11 0 10.5523 0 10V8C0 7.44772 0.447715 7 1 7H3ZM21 8C21.5523 8 22 8.44772 22 9C22 9.55228 21.5523 10 21 10H7C6.44772 10 6 9.55228 6 9C6 8.44772 6.44772 8 7 8H21ZM3 0C3.55228 0 4 0.447715 4 1V3C4 3.55228 3.55228 4 3 4H1C0.447715 4 0 3.55228 0 3V1C0 0.447715 0.447715 0 1 0H3ZM21 1C21.5523 1 22 1.44772 22 2C22 2.55228 21.5523 3 21 3H7C6.44772 3 6 2.55228 6 2C6 1.44772 6.44772 1 7 1H21Z"
                    fill="#4A4A4A"
                  />
                </svg>
                Recommended lists
              </div>
              {/* <div className="mt-4">
                <p>item1</p>
                <p>item1</p>
                <p>item1</p>
                <p>item1</p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
