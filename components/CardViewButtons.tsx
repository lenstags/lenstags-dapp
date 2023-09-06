import { ViewBy, ViewCardContext } from '@context/ViewCardContext';
import { useContext } from 'react';

const buttons = [
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

const CardViewButtons = () => {
  const { viewCard, setViewCard } = useContext(ViewCardContext);
  return (
    <div className="my-4 flex items-center gap-2 px-4">
      {buttons.map((button) => (
        <button
          key={button.name}
          style={{
            border: '1px solid black'
          }}
          className={`flex h-8 items-center px-4  py-2 font-sans  ${
            viewCard === button.view
              ? 'text-white'
              : 'border border-black bg-slate-100'
          }`}
          onClick={() => setViewCard(button.view)}
        >
          {button.name}
        </button>
      ))}
    </div>
  );
};
export default CardViewButtons;
