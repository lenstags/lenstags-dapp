import React, { useContext } from 'react';
import {
  TooltipProvider,
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow
} from './TooltipUI';
import { SidebarContext } from '@context/SideBarSizeContext';

interface TooltipProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, tooltip }) => {
  const { sidebarCollapsedStateLeft } = useContext(SidebarContext);
  if (!sidebarCollapsedStateLeft.collapsed) return <>{children}</>;
  return (
    <TooltipProvider>
      <TooltipUI>
        <TooltipTrigger className="w-full bg-transparent">
          {children}
        </TooltipTrigger>
        <TooltipContent side="right">
          {tooltip}
          <TooltipArrow />
        </TooltipContent>
      </TooltipUI>
    </TooltipProvider>
  );
};
