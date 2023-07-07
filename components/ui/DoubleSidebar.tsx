'use client';

import * as DoubleSidebarPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const DoubleSidebar = DoubleSidebarPrimitive.Root;

const DoubleSidebarTrigger = DoubleSidebarPrimitive.Trigger;

const DoubleSidebarClose = DoubleSidebarPrimitive.Close;

const DoubleSidebarPortal = ({
  className,
  ...props
}: DoubleSidebarPrimitive.DialogPortalProps) => (
  <DoubleSidebarPrimitive.Portal className={cn(className)} {...props} />
);
DoubleSidebarPortal.displayName = DoubleSidebarPrimitive.Portal.displayName;

const DoubleSidebarOverlay = React.forwardRef<
  React.ElementRef<typeof DoubleSidebarPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DoubleSidebarPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DoubleSidebarPrimitive.Overlay
    className={cn(
      'fixed inset-1 left-80 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
DoubleSidebarOverlay.displayName = DoubleSidebarPrimitive.Overlay.displayName;

const DoubleSidebarVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 h-full border-r sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm'
      }
    },
    defaultVariants: {
      side: 'left'
    }
  }
);

interface DoubleSidebarContentProps
  extends React.ComponentPropsWithoutRef<typeof DoubleSidebarPrimitive.Content>,
    VariantProps<typeof DoubleSidebarVariants> {}

const DoubleSidebarContent = React.forwardRef<
  React.ElementRef<typeof DoubleSidebarPrimitive.Content>,
  DoubleSidebarContentProps
>(({ side = 'left', className, children, ...props }, ref) => (
  <DoubleSidebarPortal>
    <DoubleSidebarOverlay />
    <DoubleSidebarPrimitive.Content
      ref={ref}
      className={cn(DoubleSidebarVariants({ side }), className)}
      {...props}
    >
      {children}
    </DoubleSidebarPrimitive.Content>
  </DoubleSidebarPortal>
));
DoubleSidebarContent.displayName = DoubleSidebarPrimitive.Content.displayName;

const DoubleSidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DoubleSidebarHeader.displayName = 'DoubleSidebarHeader';

const DoubleSidebarFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DoubleSidebarFooter.displayName = 'DoubleSidebarFooter';

const DoubleSidebarTitle = React.forwardRef<
  React.ElementRef<typeof DoubleSidebarPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DoubleSidebarPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DoubleSidebarPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
DoubleSidebarTitle.displayName = DoubleSidebarPrimitive.Title.displayName;

const DoubleSidebarDescription = React.forwardRef<
  React.ElementRef<typeof DoubleSidebarPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DoubleSidebarPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DoubleSidebarPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

DoubleSidebarDescription.displayName =
  DoubleSidebarPrimitive.Description.displayName;

export {
  DoubleSidebar,
  DoubleSidebarClose,
  DoubleSidebarContent,
  DoubleSidebarDescription,
  DoubleSidebarFooter,
  DoubleSidebarHeader,
  DoubleSidebarTitle,
  DoubleSidebarTrigger
};
