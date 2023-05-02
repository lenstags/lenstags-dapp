import React, { createContext, useState } from 'react';

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
      {props.children}
    </AppContext.Provider>
  );
}
