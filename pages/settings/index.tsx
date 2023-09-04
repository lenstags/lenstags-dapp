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
import { getIPFSImage, imageToBase64, pickPicture } from 'utils/helpers';

import FileInput from 'components/FileInput';
import ImageProxied from 'components/ImageProxied';
import { LayoutCreate } from '@components/LayoutCreate';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { NextPage } from 'next';
import { ProfileContext } from '../../components/LensAuthenticationProvider';
import { Spinner } from 'components/Spinner';
import { setProfileImageUri } from '@lib/lens/set-profile-image-uri-gasless';
import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { uploadImageIpfs } from '@lib/lens/ipfs';
import { useExplore } from '@context/ExploreContext';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { v4 as uuidv4 } from 'uuid';

export const updateLocalStorageProfile = (profileId: string) =>
  queryProfile({ profileId })
    .then((profileResult) =>
      window.localStorage.setItem('LENS_PROFILE', JSON.stringify(profileResult))
    )
    .catch((err) => console.log('Error storing updated profile: ', err));

const Settings: NextPage = () => {
  // const defaultLensProfile = useContext(ProfileContext); // TODO update lensProfile after save!

  const { profile: defaultLensProfile } = useContext(ProfileContext);

  const [lensProfile, setLensProfile] = useState(defaultLensProfile);
  // const { config } = useContext(AppContext); // TODO use later
  const snackbar = useSnackbar();
  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();

  const [dispatcherActive, setDispatcherActive] = useState(false);
  const [pictureUrl, setPictureUrl] = useState('/img/profilePic.png');
  const [loadingDispatcher, setLoadingDispatcher] = useState(false);
  const [profileValues, setProfileValues] = useState<any>({});
  const [hydrationLoading, setHydrationLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUrlBase64, setCoverUrlBase64] = useState<string>('');
  const [imageBuffer, setImageBuffer] = useState<Buffer | null>(null);
  const [coverBuffer, setCoverBuffer] = useState<Buffer | null>(null);

  setCoverBuffer;
  const [profileChanged, setProfileChanged] = useState(false);
  const [coverChanged, setCoverChanged] = useState(false);

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
      console.log('COV ', profileResult);
      setPictureUrl(pic);
      setCoverUrlBase64(getIPFSImage(cov));
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
        const base64 = reader.result as string;
        setCoverUrlBase64(base64);
        const bytes = Buffer.from(base64.split(',')[1], 'base64');
        setCoverBuffer(bytes);
        setCoverChanged(true);
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

  const handleClickSave = async () => {
    if (!lensProfile) {
      snackbar.showMessage('⚠️ Your wallet is disconnected, please log in.');
      return;
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
      // FIXME
      { name: 'Collected items', key: '0x222' } // set on the first setup
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
      key: ATTRIBUTES_LIST_KEY
    };

    let newPictureUrl: string; // url original or uploaded
    let newCoverUrl: string; // url original or uploaded

    if (profileChanged && imageBuffer) {
      snackbar.showMessage('⏱️ Uploading profile picture...');
      const imageIpfsResult = await uploadImageIpfs(imageBuffer); // uploads picture to ipfs
      newPictureUrl = `ipfs://${imageIpfsResult.path}`;
      await setProfileImageUri(lensProfile.id, dispatcherActive, newPictureUrl);
    } else {
      newPictureUrl = pickPicture(lensProfile.picture, '/img/profilePic.png'); // let's keep the original url
    }

    if (coverChanged && coverBuffer) {
      snackbar.showMessage('⏱️ Uploading cover picture...');
      const imageIpfsResult = await uploadImageIpfs(coverBuffer); // uploads picture to ipfs
      newCoverUrl = `ipfs://${imageIpfsResult.path}`;
    } else {
      newCoverUrl = pickPicture(
        lensProfile.coverPicture,
        '/img/profilePic.png'
      ); // let's keep the original url
    }
    snackbar.showMessage('⏱️ Saving it all...');

    const profileMetadata: ProfileMetadata = {
      version: '1.0.0', // TODO: centralize this!
      metadata_id: uuidv4(),
      name: profileValues.name,
      bio: profileValues.bio || 'empty bio',
      cover_picture: newCoverUrl || (await imageToBase64('/img/back.png')),
      profile_picture: newPictureUrl,
      attributes: [attLocation, attTwitter, attWebsite, attLists]
    };

    updateProfileMetadata(lensProfile.id, profileMetadata)
      .then(() => {
        snackbar.showMessage('🟩 Profile updated successfully 👤');
        updateLocalStorageProfile(lensProfile.id);
      })
      .catch((err) => {
        snackbar.showMessage('❌ Unexpected error: ' + err.message);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleClickDispatcher = async () => {
    if (lensProfile) {
      setLoadingDispatcher(true);
      dispatcherActive
        ? await disable(lensProfile.id)
            .then(() => setDispatcherActive(false))
            .finally(() => setLoadingDispatcher(false))
        : await enable(lensProfile.id)
            .then(() => setDispatcherActive(true))
            .finally(() => setLoadingDispatcher(false));
    }
    return;
  };

  return (
    <LayoutCreate
      title="Nata Social | Settings"
      pageDescription="Settings"
      breadcumpTitle="Settings"
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      <div className="flex w-full">sddsd</div>
      {hydrationLoading ? (
        <div className="flex w-full justify-center p-10">
          <Spinner h="10" w="10" />
        </div>
      ) : (
        <div className="flex w-full bg-red-500">
          <div className="w-8/12 ">
            <h1 className="py-2 font-serif font-bold">Settings</h1>

            <p className="px-6 py-4 font-serif">Profile</p>

            <div className="font-sans text-sm">
              <div className="mx-6 my-4">
                <div className="mb-4 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-2">Handle</div>
                  <div className="col-span-4 rounded-sm  px-3 py-2 font-mono text-xs text-gray-400">
                    {profileValues.handle} (Id {profileValues.id})
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-10">
                    <input
                      // className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 outline-none"
                      className="lens-input"
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
                      // className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                      className="lens-input"
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
                      // className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                      className="lens-input"
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
                      // className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                      className="lens-input"
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
                      // className="w-full rounded border-2 border-gray-300 bg-white px-3 py-2 text-sm  text-gray-600 outline-none"
                      className="lens-input"
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
                        className="ml-6 rounded-full object-cover"
                        src={pictureUrl}
                        alt="User profile picture"
                        width={70}
                        height={70}
                      />
                    </div>
                  </div>
                  <FileInput handleImageChange={handlePictureChange} />
                </div>

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

            <div className="flex justify-end py-4">
              {!saving ? (
                // <button
                //   onClick={handleClickSave}
                //   className="flex items-center  rounded-lg border-2 border-solid
                //    border-black bg-lensPurple px-4 py-2 text-xl text-white"
                // >
                <button
                  onClick={handleClickSave}
                  className="rounded-lg px-4  py-2 align-middle font-serif font-bold text-white"
                >
                  SAVE
                </button>
              ) : (
                <span
                  className="flex items-center  rounded-lg border-2 border-solid border-gray-500
                 bg-gray-400 px-4 py-2 text-xl text-white"
                >
                  <Spinner h="5" w="5" />
                  <span className="ml-2">Saving</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutCreate>
  );
};

export default Settings;
