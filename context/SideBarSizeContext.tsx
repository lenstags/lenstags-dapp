import { PublicRoutes } from 'models';
import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';

export interface SidebarCollapsedState {
  collapsed: boolean;
}

export interface TriggerByProps {
  triggerBy: 'notification' | 'my-inventory' | 'none';
}

interface Context {
  sidebarCollapsedStateLeft: SidebarCollapsedState;
  setSidebarCollapsedState: (
    sidebarCollapsedState: SidebarCollapsedState
  ) => void;
  triggerBy: TriggerByProps['triggerBy'];
  setTriggerBy: (triggerBy: TriggerByProps['triggerBy']) => void;
}

export const SidebarContext = createContext<Context>({
  sidebarCollapsedStateLeft: {
    collapsed: false
  },
  setSidebarCollapsedState: () => {},
  triggerBy: 'none',
  setTriggerBy: () => {}
});

export const SidebarContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [sidebarCollapsedStateLeft, setSidebarCollapsedState] =
    useState<SidebarCollapsedState>({
      collapsed: false
    });

  const [triggerBy, setTriggerBy] =
    useState<TriggerByProps['triggerBy']>('none');

  const routesCollapsed = [
    PublicRoutes.CREATE,
    PublicRoutes.LIST,
    PublicRoutes.POST
  ];

  const router = useRouter();
  const currentRoute = router.pathname;

  useEffect(() => {
    if (sidebarCollapsedStateLeft.collapsed) {
      setSidebarCollapsedState({
        collapsed: false
      });
    }
    const isCollapsedRoute = routesCollapsed.some((route) =>
      currentRoute.startsWith(route)
    );
    if (isCollapsedRoute) {
      setSidebarCollapsedState({
        collapsed: isCollapsedRoute
      });
    }
    if (triggerBy !== 'none') {
      setTriggerBy('none');
    }
  }, [currentRoute]);

  useEffect(() => {
    if (
      triggerBy === 'none' &&
      sidebarCollapsedStateLeft.collapsed &&
      !routesCollapsed.some((route) => currentRoute.startsWith(route))
    ) {
      setSidebarCollapsedState({
        collapsed: false
      });
    } else if (
      triggerBy !== 'none' &&
      !sidebarCollapsedStateLeft.collapsed &&
      routesCollapsed.some((route) => currentRoute.startsWith(route))
    ) {
      setSidebarCollapsedState({
        collapsed: true
      });
    }
  }, [triggerBy, currentRoute]); // fetch triggerBy with delay

  return (
    <SidebarContext.Provider
      value={{
        sidebarCollapsedStateLeft,
        setSidebarCollapsedState,
        triggerBy,
        setTriggerBy
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
