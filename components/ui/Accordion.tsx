'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(
  (
    { className, arrowLeft = false, hiddenArrow = false, children, ...props },
    ref
  ) => (
    <AccordionPrimitive.Header className="flex h-full w-full">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={`${
          arrowLeft && 'flex-row-reverse'
        } flex flex-1 items-center text-sm font-medium transition-all [&[data-state=open]>div]:border-l-teal-400 [&[data-state=open]>div]:font-bold [&[data-state=open]>svg]:rotate-90 `}
        {...props}
      >
        <div
          className={cn('flex w-full cursor-pointer items-center', className)}
        >
          {children}
        </div>
        {!hiddenArrow && <ChevronRightIcon className="h-6 w-6" />}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down',
      className
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
