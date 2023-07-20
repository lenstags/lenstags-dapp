import React, { useContext } from 'react';
import {
  TooltipProvider,
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow
} from './TooltipUI';
import { SidebarContext } from '@context/SideBarSizeContext';
import { cn } from '@lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  tooltip,
  className
}) => {
  const { sidebarCollapsedStateLeft } = useContext(SidebarContext);
  if (!sidebarCollapsedStateLeft.collapsed) return <>{children}</>;
  return (
    <TooltipProvider>
      <TooltipUI>
        <TooltipTrigger
          className={cn('h-max w-full bg-transparent', className)}
        >
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
