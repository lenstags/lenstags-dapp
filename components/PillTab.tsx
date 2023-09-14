import { ViewBy } from '@context/ViewCardContext';
import {
  QueueListIcon,
  RectangleStackIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { ReactElement, useState } from 'react';

interface PillProps {
  [key: string]: (props: any) => JSX.Element;
}

interface PillTabProps {
  viewCard: typeof ViewBy.CARD | typeof ViewBy.POST | typeof ViewBy.LIST;
  setViewCard: (
    view: typeof ViewBy.CARD | typeof ViewBy.POST | typeof ViewBy.LIST
  ) => void;
}

const Pill: PillProps = {
  [ViewBy.CARD]: ({ className }) => (
    <Squares2X2Icon className={`h-6 w-6 ${className}`} />
  ),
  [ViewBy.LIST]: ({ className }) => (
    <QueueListIcon className={`h-6 w-6 ${className}`} />
  ),
  [ViewBy.POST]: ({ className }) => (
    <RectangleStackIcon className={`h-6 w-6 ${className}`} />
  )
};

const Elements = [
  {
    name: 'All',
    view: ViewBy.CARD
  },
  {
    name: 'Lists',
    view: ViewBy.LIST
  },
  {
    name: 'Posts',
    view: ViewBy.POST
  }
];

const PillTab: React.FC<PillTabProps> = ({ viewCard, setViewCard }) => {
  return (
    <div className="flex h-max w-max items-center justify-center gap-2 rounded-lg bg-slate-100 p-2">
      {Elements.map((element) => (
        <button
          key={element.name}
          className={`flex h-12 w-12 items-center justify-center rounded-tl-lg focus:outline-none ${
            viewCard === element.view
              ? 'bg-[--button_outline_color]'
              : 'bg-slate-50'
          }`}
          onClick={() => setViewCard(element.view)}
        >
          {Pill[element.view]({
            className:
              viewCard === element.view ? 'text-white' : 'text-gray-900'
          })}
        </button>
      ))}
    </div>
  );
};
export default PillTab;
