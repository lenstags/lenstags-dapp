// import { ProfileQuery } from 'lib/lens/graphql/generated';
// import React, { Dispatch, SetStateAction, useState } from 'react';

// interface ProfileContextType {
//   profile: ProfileQuery['profile'] | undefined;
//   pictureUrl?: string | undefined;
//   setProfile: (pp: ProfileQuery['profile'] | undefined) => void;
//   //   setProfile: Dispatch<SetStateAction<Profile | null>>; // TODO not sure about this
// }

// interface ProfileProviderProps {
//   children: React.ReactNode;
// }

// export const ProfileContext = React.createContext<ProfileContextType>({
//   // default values
//   profile: undefined,
//   pictureUrl: '/img/profilePic.png',
//   setProfile: () => {}
// });

// export const ProfileContextProvider = ({ children }: ProfileProviderProps) => {
//   const [profile, setProfile] = useState<ProfileQuery['profile'] | undefined>(
//     undefined
//   );
//   // console.log('🇹🇷🇹🇷🇹🇷 PROFILE SET: ', typeof profile);

//   return (
//     <ProfileContext.Provider value={{ profile, setProfile }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };

export const foo = {};
