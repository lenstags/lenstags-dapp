import React, { ReactNode, createContext, useContext, useState } from 'react';

import { ProfileContext } from '@components/LensAuthenticationProvider';

interface ExploreContextProps {
  isExplore: boolean;
  setIsExplore: React.Dispatch<React.SetStateAction<boolean>>;
  skipExplore: boolean;
  setSkipExplore: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExploreContext = createContext<ExploreContextProps | undefined>(
  undefined
);

interface ExploreProviderProps {
  children: ReactNode;
}

export const ExploreProvider: React.FC<ExploreProviderProps> = ({
  children
}) => {
  const { profile: lensProfile } = useContext(ProfileContext);
  const [isExplore, setIsExplore] = useState<boolean>(
    lensProfile ? false : true
  );
  const [skipExplore, setSkipExplore] = useState<boolean>(
    lensProfile ? true : false //: true
  );

  return (
    <ExploreContext.Provider
      value={{ isExplore, setIsExplore, skipExplore, setSkipExplore }}
    >
      {children}
    </ExploreContext.Provider>
  );
};

export const useExplore = (): ExploreContextProps => {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
};
