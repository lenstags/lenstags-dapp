const LS_LENS_STORE = "lens.store";

export type LensLocalStorage = {
  accessToken: string;
  refreshToken: string;
  handle: string;
  name: string;
  pictureUrl: string | null;
  id: string;
  bio: string;
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
  window.localStorage.setItem(LS_LENS_STORE, JSON.stringify(lensStore));
};

export const deleteLensLocalStorage = () => {
  window.localStorage.removeItem(LS_LENS_STORE);
};
