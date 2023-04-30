/* eslint-disable @next/next/no-img-element */

import {
  ATTRIBUTES_LIST_KEY,
  DEFAULT_IMAGE_IPFS_PROFILE,
  IPFS_PROXY_URL
} from '@lib/config';
import {
  AttributeData,
  ProfileMetadata
} from '@lib/lens/interfaces/profile-metadata';
import React, { useContext, useEffect, useState } from 'react';
import { disable, enable, queryProfile } from '@lib/lens/dispatcher';
import { imageToBase64, pickPicture } from '@lib/helpers';

import { AppContext } from 'context/AppContext';
import FileInput from 'components/FileInput';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { NextPage } from 'next';
import { ProfileContext } from '../../components/LensAuthenticationProvider';
import { createDefaultList } from '@lib/lens/load-lists';
import { setProfileImageUri } from '@lib/lens/set-profile-image-uri-gasless';
import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { uploadImageIpfs } from '@lib/lens/ipfs';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { v4 as uuidv4 } from 'uuid';

// import { ProfileContext } from 'components/ProfileContext';

export const updateLocalStorageProfile = (profileId: string) =>
  queryProfile({ profileId })
    .then((profileResult) =>
      window.localStorage.setItem('LENS_PROFILE', JSON.stringify(profileResult))
    )
    .catch((err) => console.log('Error storing updated profile: ', err));

const Settings: NextPage = () => {
  const defaultLensProfile = useContext(ProfileContext); // TODO update lensProfile after save!
  const [lensProfile, setLensProfile] = useState(defaultLensProfile);
  // const { config } = useContext(AppContext); // TODO use later
  const snackbar = useSnackbar();

  const [dispatcherActive, setDispatcherActive] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [pictureUrl, setPictureUrl] = useState('/img/profilePic.png');
  const [loadingDispatcher, setLoadingDispatcher] = useState(false);
  const [profileValues, setProfileValues] = useState<any>({});
  const [hydrationLoading, setHydrationLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUrlBase64, setCoverUrlBase64] = useState<string>('');
  const [imageBuffer, setImageBuffer] = useState<Buffer | null>(null);
  const [profileChanged, setProfileChanged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!defaultLensProfile) return;
      const profileResult = await queryProfile({
        profileId: defaultLensProfile.id
      });
      setLensProfile(profileResult);
      setDispatcherActive(
        profileResult?.dispatcher?.canUseRelay
          ? profileResult?.dispatcher?.canUseRelay
          : false
      );

      const pic = pickPicture(profileResult?.picture, '/img/profilePic.png');
      const cov = pickPicture(profileResult?.coverPicture, '/img/back.png');

      setPictureUrl(pic);
      setCoverUrlBase64(cov);
      setProfileValues(profileResult);
      window.localStorage.setItem(
        'LENS_PROFILE',
        JSON.stringify(profileResult)
      );
      setHydrationLoading(false);
    };
    fetchData().catch(console.error);
  }, [defaultLensProfile]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverUrlBase64(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPictureUrl(base64);
        const bytes = Buffer.from(base64.split(',')[1], 'base64');
        setImageBuffer(bytes);
        setProfileChanged(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFindDefault = async () => {
    const profileResult = await queryProfile({ profileId: lensProfile?.id });

    let defaultListId = profileResult?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value;
    console.log('list result?: ', defaultListId);

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

    // FIXME Simplify this
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

    let newPictureUrl: string; // url original or uploaded

    if (profileChanged && imageBuffer) {
      const imageIpfsResult = await uploadImageIpfs(imageBuffer); // uploads picture to ipfs
      newPictureUrl = `ipfs://${imageIpfsResult.path}`;
      await setProfileImageUri(lensProfile.id, dispatcherActive, newPictureUrl);
    } else {
      newPictureUrl = pickPicture(lensProfile.picture, '/img/profilePic.png'); // let's keep the original url
    }

    const profileMetadata: ProfileMetadata = {
      version: '1.0.0', // TODO: centralize this!
      metadata_id: uuidv4(),
      name: profileValues.name,
      bio: profileValues.bio || 'empty bio',
      cover_picture: coverUrlBase64 || (await imageToBase64('/img/back.png')),
      profile_picture: newPictureUrl,
      attributes: [attLocation, attTwitter, attWebsite, attLists]
    };

    updateProfileMetadata(lensProfile.id, profileMetadata)
      .then((updateResult) => {
        console.log('update result> ', updateResult);
        snackbar.showMessage(
          '✅ Profile updated successfully'
          // 'Undo', () => handleUndo()
        );
        setIsSuccessVisible(true);
        updateLocalStorageProfile(lensProfile.id);
      })
      .catch((err) => {
        console.log('ERRORR ', err); // TODO show toast error
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleClickDispatcher = async () => {
    if (lensProfile) {
      setLoadingDispatcher(true);
      dispatcherActive
        ? await disable(lensProfile.id).then(() => setDispatcherActive(false))
        : await enable(lensProfile.id).then(() => setDispatcherActive(true));
    }
    return;
  };

  return (
    <Layout title="Lenstags | Settings" pageDescription="Settings">
      {hydrationLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="md:w-1/2 container mx-auto h-64 w-11/12 px-6 py-10 text-black">
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

                {}
                <p
                  // FIXME
                  onDoubleClick={handleFindDefault}
                  // onClick={handleFindDefault}
                  className={`flex rounded-lg border-2 border-solid border-black px-3 py-2
                   text-white disabled:bg-gray-300 `}
                >
                  Find default list
                </p>
              </div>
            </div>
          </div>

          <p className="px-6 py-4">Profile</p>
          <div
            style={{ borderWidth: '0.5px', borderColor: '#949494' }}
            className="rounded-md font-extralight shadow-md"
          >
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

              {/* <div className="grid grid-cols-12 items-center gap-4"> */}
              <div className=" grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Profile pic</div>

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
                <FileInput handleImageChange={handlePictureChange} />
              </div>

              {/* <div className="col-span-1">
                Cover
                <span
                  className="focus:border-brand-400 mx-2   cursor-pointer rounded-md border border-gray-300 bg-white
                 px-4 py-2   text-sm text-gray-700  shadow-md
                 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <div className="flex">
                    <img
                      className=" "
                      src="/assets/icons/addFile.svg"
                      alt="Add file"
                      width={20}
                      height={20}
                    />
                    <label>
                      Choose File
                      <input
                        className="hidden"
                        name="cover"
                        id="cover"
                        accept=".png, .jpg, .jpeg"
                        type="file"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </span>
              </div> */}

              <div className=" grid grid-cols-12 items-center gap-4">
                <div className="col-span-2">Cover</div>

                <FileInput handleImageChange={handleCoverChange} />
              </div>

              {coverUrlBase64 && (
                <div className="col-span-5">
                  <div className="w-full px-6 py-4">
                    <img
                      // TODO use crop on coming version
                      className="w-full rounded-lg"
                      src={coverUrlBase64}
                      alt="User cover picture"
                      // width={100}
                      // height={100}
                      // objectFit="cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleClickSave}
            className={`flex rounded-lg border-2 border-solid border-black px-3 py-2
                   text-white disabled:bg-gray-300 `}
          >
            Save
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Settings;
