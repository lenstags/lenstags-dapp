import React, { createContext, useState, useContext } from 'react';

const TabContext = createContext({
  activeTab: 0,
  setActiveTab: (index: number) => {}
});

interface TabsProps {
  children: React.ReactNode;
  defaultTab?: number;
}

interface TabListProps {
  children: React.ReactNode;
}

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
}

export const Tabs = ({ children, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 0);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const TabList = ({ children }: TabListProps) => {
  return <div className="tab-list">{children}</div>;
};

export const Tab = ({ children }: TabListProps) => {
  return <div className="tab">{children}</div>;
};

export const TabPanels = ({ children }: TabListProps) => {
  return <div className="tab-panels">{children}</div>;
};

export const TabPanel = ({ children, index }: TabPanelProps) => {
  const { activeTab } = useContext(TabContext);
  console.log('activeTab', activeTab);
  return (
    <div className={`tab-panel ${activeTab === index ? 'active' : ''}`}>
      {children}
    </div>
  );
};
