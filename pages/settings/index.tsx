import {
  AttributeData,
  ProfileMetadata
} from '@lib/lens/interfaces/profile-metadata';
import React, { useContext, useEffect, useState } from 'react';
// import { ProfileContext } from 'components/ProfileContext';
import { disable, enable, queryProfile } from '@lib/lens/dispatcher';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { NextPage } from 'next';
import { ProfileContext } from '../../components/LensAuthenticationProvider';
import { createDefaultList } from '@lib/lens/load-lists';
import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { v4 as uuidv4 } from 'uuid';

const Settings: NextPage = () => {
  const lensProfile = useContext(ProfileContext);
  const [dispatcherActive, setDispatcherActive] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [pictureUrl, setPictureUrl] = useState('/img/profilePic.png');
  const [loadingDispatcher, setLoadingDispatcher] = useState(false);
  const [profileValues, setProfileValues] = useState<any>({});
  const [hydrationLoading, setHydrationLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!lensProfile) return;

      const profileResult = await queryProfile({ profileId: lensProfile.id });
      setDispatcherActive(
        profileResult?.dispatcher?.canUseRelay
          ? profileResult?.dispatcher?.canUseRelay
          : false
      );

      const pic =
        lensProfile.picture?.__typename === 'MediaSet'
          ? lensProfile.picture?.original.url
          : lensProfile.picture?.__typename === 'NftImage'
          ? lensProfile.picture.uri
          : '/img/profilePic.png';

      setPictureUrl(pic);
      setProfileValues(profileResult);
      window.localStorage.setItem(
        'LENS_PROFILE',
        JSON.stringify(profileResult)
      );
      setHydrationLoading(false);
    };
    fetchData().catch(console.error);
  }, [lensProfile]);

  const handleFindDefault = async () => {
    const profileResult = await queryProfile({ profileId: lensProfile?.id });

    let defaultListId = profileResult?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value;

    console.log('list result?: ', profileResult);

    if (!defaultListId) {
      return defaultListId
        ? JSON.parse(defaultListId)
        : await createDefaultList(lensProfile);

      // FIXME
      // create the default and update the list
      // console.log(not);
    }
  };

  const handleClickSave = async () => {
    if (!lensProfile) {
      throw 'No lens profile found';
    }

    setSaving(true);

    const attLocation: AttributeData = {
      displayType: MetadataDisplayType.string,
      traitType: 'string',
      value:
        profileValues.location ||
        profileValues?.attributes?.find(
          (attribute: AttributeData) => attribute.key === 'location'
        )?.value,
      key: 'location'
    };

    const attTwitter: AttributeData = {
      displayType: MetadataDisplayType.string,
      traitType: 'string',
      value:
        profileValues.twitter ||
        profileValues?.attributes?.find(
          (attribute: AttributeData) => attribute.key === 'twitter'
        )?.value,
      key: 'twitter'
    };

    const attWebsite: AttributeData = {
      displayType: MetadataDisplayType.string,
      traitType: 'string',
      value:
        profileValues.website ||
        profileValues?.attributes?.find(
          (attribute: AttributeData) => attribute.key === 'website'
        )?.value,
      key: 'website'
    };

    const listsObject = [
      { name: 'default', key: '0x222' } // set on the first setup
      // { name: 'anotherlist', key: '0x344' }
    ];
    const attLists: AttributeData = {
      displayType: MetadataDisplayType.string,
      traitType: 'string',
      value:
        // profileValues.lists ||
        // profileValues?.attributes?.find(
        //   (attribute: AttributeData) => attribute.key === 'lists0'
        // )?.value,
        JSON.stringify(listsObject),
      key: 'lists0'
    };

    // {"displayType":"string",
    // "traitType":"string",
    // "key":"twitter",
    // "value":"@lenstags",
    // "__typename":"Attribute"}

    // default list setup

    const profileMetadata: ProfileMetadata = {
      version: '1.0.0', // TODO: centralize this!
      metadata_id: uuidv4(),
      name: profileValues.name,
      bio: profileValues.bio || 'empty bio',
      cover_picture: 'https://picsum.photos/200/333',
      profile_picture: 'https://picsum.photos/200/444',
      attributes: [attLocation, attTwitter, attWebsite, attLists]
    };

    await updateProfileMetadata(lensProfile.id, profileMetadata);
    setSaving(false);
    const profileResult = await queryProfile({
      profileId: lensProfile.id
    });

    console.log(' MY PROFILE UPDATED 💙💙💙💙 ', profileResult);
    setIsSuccessVisible(true);

    window.localStorage.setItem('LENS_PROFILE', JSON.stringify(profileResult));
  };

  const handleClickDispatcher = async () => {
    if (lensProfile) {
      setLoadingDispatcher(true);
      dispatcherActive
        ? await disable(lensProfile.id)
        : await enable(lensProfile.id).then(() => console.log('termine'));
    }
    // router.push('/');
    return;
  };

  return (
    <Layout title="Lenstags | Settings" pageDescription="Settings">
      {hydrationLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="container mx-auto h-64 w-11/12 px-6 py-10 text-black md:w-1/2">
          <h1 className=" text-2xl">Settings</h1>

          <p className="px-6 py-4">Dispatcher</p>
          <div
            style={{ borderWidth: '0.5px', borderColor: '#949494' }}
            className="rounded-md font-extralight shadow-md"
          >
            <div className="flex items-center px-6 py-4">
              <div className="items-center">
                The transaction Dispatcher is{' '}
                <span className="  ml-2 rounded-lg   border-amber-200 bg-amber-100 px-3 py-1  text-amber-600">
                  {dispatcherActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="relative ml-4 inline-flex cursor-pointer items-center">
                <div className="flex items-center justify-center">
                  <button
                    disabled={loadingDispatcher}
                    onClick={handleClickDispatcher}
                    className={`text-black ${
                      dispatcherActive
                        ? 'bg-purple-400 hover:bg-purple-300'
                        : ' bg-green-100 hover:bg-lensGreen'
                    } flex rounded-lg border-2 border-solid border-black px-3 py-2  text-white disabled:bg-gray-300 `}
                  >
                    {loadingDispatcher && (
                      <svg
                        className="mr-2 h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}

                    {dispatcherActive ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <button
                  onClick={handleFindDefault}
                  className={`flex rounded-lg border-2 border-solid border-black px-3 py-2
                   text-white disabled:bg-gray-300 `}
                >
                  Find default list
                </button>
              </div>
            </div>
          </div>

          <p className="px-6 py-4">Profile</p>
          <div
            style={{ borderWidth: '0.5px', borderColor: '#949494' }}
            className="rounded-md font-extralight shadow-md"
          >
            {/* TODO: row, COMPONENTIZE THIS!*/}
            {/* <div className="px-6 py-4">
              <div className="flex items-center">
                <span className="">Name</span>
                <input
                  className=" mx-4 rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 outline-none"
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={profileValues?.name || ''}
                  onChange={(e) =>
                    setProfileValues({ ...profileValues, name: e.target.value })
                  }
                />

                <span className="w-full py-2 text-right text-sm text-gray-400 ">
                  Profile id&nbsp; {lensProfile?.id || 'no-name'}
                </span>
              </div>
            </div> */}

            <div className="mx-6 my-4">
              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Handle</div>
                <div className="col-span-4 rounded-sm bg-gray-100 px-3 py-2 text-center font-mono text-xs text-gray-400">
                  {profileValues.handle}
                </div>
                <div className="col-span-3 rounded-sm bg-gray-100 px-3 py-2 text-center font-mono text-xs text-gray-400">
                  Id {profileValues.id}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Name</div>
                <div className="col-span-10">
                  <input
                    className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 outline-none"
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={profileValues?.name || ''}
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        name: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">
                  {/* <span className="">Bio</span> */}
                  Bio
                </div>
                <div className="col-span-10">
                  <input
                    className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                    type="text"
                    name="bio"
                    id="bio"
                    defaultValue={profileValues?.bio}
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        bio: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">
                  {/* <span className="">Location</span> */}
                  Location
                </div>
                <div className="col-span-10">
                  <input
                    className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                    type="text"
                    name="location"
                    id="location"
                    defaultValue={
                      profileValues?.attributes?.find(
                        (attribute: AttributeData) =>
                          attribute.key === 'location'
                      )?.value
                    }
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        location: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">
                  {/* <span className="">Website</span> */}
                  Website
                </div>
                <div className="col-span-10">
                  <input
                    className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                    type="text"
                    name="website"
                    defaultValue={
                      profileValues?.attributes?.find(
                        (attribute: AttributeData) =>
                          attribute.key === 'website'
                      )?.value
                    }
                    id="name"
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        website: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">
                  {/* <span className="">Twitter</span> */}
                  Twitter
                </div>
                <div className="col-span-10">
                  <input
                    className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                    type="text"
                    name="twitter"
                    id="twitter"
                    defaultValue={
                      profileValues?.attributes?.find(
                        (attribute: AttributeData) =>
                          attribute.key === 'twitter'
                      )?.value
                    }
                    onChange={(e) =>
                      setProfileValues({
                        ...profileValues,
                        twitter: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">
                  Profile pic
                  {/* <span className="ml-6">Profile</span> */}
                </div>
                <div className="col-span-3">
                  <div className="px-6 py-4">
                    <ImageProxied
                      category="profile"
                      className="ml-6 rounded-full"
                      src={pictureUrl}
                      alt="User profile picture"
                      width={70}
                      height={70}
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  Cover
                  {/* <span className="ml-6">Cover</span> */}
                </div>
                <div className="col-span-5">
                  <div className="w-full px-6 py-4">
                    <ImageProxied
                      category="profile"
                      className="w-full rounded-lg"
                      src={pictureUrl}
                      alt="User cover picture"
                      width={100}
                      height={100}
                      objectFit="cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="px-6 py-4">Actives lists</p>
          <div
            style={{ borderWidth: '0.5px', borderColor: '#949494' }}
            className="rounded-md font-extralight shadow-md"
          >
            <div className="mx-6 my-4">
              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Attributes</div>
                <div className="col-span-10">
                  {
                    profileValues?.attributes?.find(
                      (attribute: AttributeData) => attribute.key === 'lists'
                    )?.value

                    // {"displayType":"string",
                    // "traitType":"string",
                    // "key":"twitter",
                    // "value":"@lenstags",
                    // "__typename":"Attribute"}

                    // JSON.stringify(profileValues)
                  }
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Website</div>
                <div className="col-span-10">
                  {
                    profileValues?.attributes?.find(
                      (attribute: AttributeData) => attribute.key === 'website'
                    )?.value
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Settings;
