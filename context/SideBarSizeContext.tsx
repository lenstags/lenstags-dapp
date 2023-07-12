import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';

export interface SidebarCollapsedState {
  collapsed: boolean;
}

interface Context {
  sidebarCollapsedStateLeft: SidebarCollapsedState;
  setSidebarCollapsedState: (
    sidebarCollapsedState: SidebarCollapsedState
  ) => void;
}

export const SidebarContext = createContext<Context>({
  sidebarCollapsedStateLeft: {
    collapsed: false
  },
  setSidebarCollapsedState: () => {}
});

export const SidebarContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [sidebarCollapsedStateLeft, setSidebarCollapsedStateLeft] =
    useState<SidebarCollapsedState>({
      collapsed: false
    });

  const router = useRouter();

  useEffect(() => {
    if (sidebarCollapsedStateLeft.collapsed) {
      setSidebarCollapsedStateLeft({
        collapsed: false
      });
    }
  }, [router.pathname]);

  return (
    <SidebarContext.Provider
      value={{
        sidebarCollapsedStateLeft,
        setSidebarCollapsedState: setSidebarCollapsedStateLeft
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
