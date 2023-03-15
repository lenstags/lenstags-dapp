import { ProfileQuery } from './graphql/generated';

const LS_LENS_STORE = 'lens_store';

export type LensLocalStorage = {
  accessToken: string;
  refreshToken: string;
  profile: ProfileQuery['profile'];
  // bio: string;
  // canUseRelay: boolean | undefined;
  // coverUrl: string | null;
  // id: string;
  // handle: string;
  // name: string;
  // pictureUrl: string | null;
  // attributes: AttributeData[];
};

export const getFromLocalStorage = (): LensLocalStorage | null => {
  const lsLensStoreStr = window.localStorage.getItem(LS_LENS_STORE);
  if (!lsLensStoreStr) {
    return null;
  }

  try {
    const lensStore = JSON.parse(lsLensStoreStr);
    return lensStore as LensLocalStorage;
  } catch (err) {
    return null;
  }
};

export const setLensLocalStorage = (lensStore: LensLocalStorage) => {
  console.log('seteando storage: ', lensStore);
  console.log('type storage: ', typeof lensStore.profile?.attributes);
  window.localStorage.setItem(LS_LENS_STORE, JSON.stringify(lensStore));
};

export const deleteLensLocalStorage = () => {
  window.localStorage.removeItem(LS_LENS_STORE);
};
