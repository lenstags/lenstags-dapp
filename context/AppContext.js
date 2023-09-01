import React, { createContext, useState } from 'react';
import { SidebarContextProvider } from './SideBarSizeContext';
import { ViewCardContextProvider } from './ViewCardContext';

export const AppContext = createContext();

export function AppProvider(props) {
  const [config, setConfig] = useState({
    isDarkMode: false,
    firstRun: true,
    dummyValue: ''
  });

  const updateConfig = (newConfig) => {
    setConfig({ ...config, ...newConfig });
  };

  return (
    <AppContext.Provider value={{ config, updateConfig }}>
      <SidebarContextProvider>
        <ViewCardContextProvider>{props.children}</ViewCardContextProvider>
      </SidebarContextProvider>
    </AppContext.Provider>
  );
}
