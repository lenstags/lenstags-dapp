import { Layout } from 'components';
import { ProfileContext } from 'components';
import { enable, disable, queryProfile } from '@lib/lens/dispatcher';
import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import ImageProxied from 'components/ImageProxied';
import { useRouter } from 'next/router';


const Settings: NextPage = () => {
  const lensProfile = useContext(ProfileContext);
  const [checked, setChecked] = useState(false);
  const [loading, setloading] = useState(false);

const router = useRouter()
  queryProfile({ profileId: lensProfile?.id }).then((profile) => {
    setChecked(
      profile?.dispatcher?.canUseRelay
        ? profile?.dispatcher?.canUseRelay
        : false
    );
  });

  const handleChange = async () => {

    if (lensProfile) {
      setloading(true)
      checked ? await disable(lensProfile.id) : await enable(lensProfile.id)
      .then(() => console.log('termine'))
    }
    router.push('/')
    return;
  };

  return (
    <Layout title="Lenstags | Settings" pageDescription="Settings">
      <div className="container mx-auto py-10 h-64 md:w-1/2 w-11/12 px-6 text-black">
        <h1 className=" text-2xl">Settings</h1>

        <p className="px-6 py-4">Dispatcher</p>
        <div
          style={{ borderWidth: '0.5px', borderColor: '#949494' }}
          className="shadow-md rounded-md font-extralight"
        >
          <p className="px-6 py-4">
            Set the dispatcher function to active
            <label className="inline-flex relative items-center cursor-pointer ml-4">
              <div className="flex items-center justify-center">
                {/*<input
                  type="checkbox"
                  className="appearance-none w-9 focus:outline-none checked:bg-blue-300 h-5
                   bg-gray-300 rounded-full before:inline-block before:rounded-full before:bg-blue-500
                    before:h-4 before:w-4 checked:before:translate-x-full shadow-inner transition-all duration-300 
                    before:ml-0.5"
                  checked={checked}
                  onChange={handleChange}
  />*/}
                {loading && <svg
                  aria-hidden="true"
                  className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-lime-300"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>}
                <button disabled={loading} onClick={handleChange} className={`${checked ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'} disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-full `}>{checked ? 'Disable' : 'Enable'}</button>

              </div>

              {/* <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
             rounded-full peer
              peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px]
               after:bg-white
               after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
               peer-checked:bg-greenLengs"
              ></div> */}
            </label>
          </p>
        </div>

        <p className="px-6 py-4">Profile</p>
        <div
          style={{ borderWidth: '0.5px', borderColor: '#949494' }}
          className="shadow-md rounded-md font-extralight"
        >
          {/* TODO: row, COMPONENTIZE THIS!*/}
          <div className="px-6 py-4">
            <span className="">Profile Id</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
              value={lensProfile?.id || 'no-name'}
            />
            <span className="">Name</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="name"
              id="name"
              value={lensProfile?.name || 'no-name'}
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Location</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
            />
            <span className="">Website</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Twitter</span>
            <input
              className=" text-sm border-2 px-3 py-2 mx-4 leading-none text-gray-600 bg-white rounded border-gray-300 outline-none"
              type="text"
              name="profileId"
              id="profileId"
            />
          </div>

          <div className="px-6 py-4">
            <span className="">Style</span>
            <ImageProxied
              category="profile"
              className="ml-6 rounded-full"
              src={lensProfile?.pictureUrl || '/img/logo-extended.svg'}
              alt="User profile picture"
              width={70}
              height={70}
              objectFit="cover"
            />
          </div>
        </div>

        <p className="px-6 py-4">Account</p>
        <div
          style={{ borderWidth: '0.5px', borderColor: '#949494' }}
          className="shadow-md rounded-md font-extralight"
        >
          <p className="px-6 py-4">Further account options</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
