import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import { useState } from 'react';

type Panel = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type CollapsiblePanelsProps = {
  panels: Panel[];
};

const CollapsiblePanels = ({ panels }: CollapsiblePanelsProps) => {
  const [activePanel, setActivePanel] = useState<string | null>(panels[0].id);

  const handleClick = (id: string) => {
    setActivePanel(id === activePanel ? null : id);
  };

  return (
    <div>
      {panels.map(({ id, title, content }) => (
        <div key={id}>
          <div
            className={` mx-4 flex items-center justify-between border-b  py-3 
              ${id === activePanel ? 'bg-white' : 'cursor-pointer  '}`}
            onClick={() => handleClick(id)}
          >
            <h2 className="text-sm font-semibold">{title}</h2>
            {id === activePanel ? (
              <MdExpandLess className="text-gray-600" />
            ) : (
              <MdExpandMore className="text-gray-600" />
            )}
          </div>
          {id === activePanel && (
            <div className="p-4 animate-in fade-in-5  duration-1000 ">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollapsiblePanels;
