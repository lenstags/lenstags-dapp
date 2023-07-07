import React, { createContext, useState } from 'react';
import { SidebarContextProvider } from './SideBarSizeContext';

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
      <SidebarContextProvider>{props.children}</SidebarContextProvider>
    </AppContext.Provider>
  );
}
