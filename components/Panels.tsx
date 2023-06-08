import { MdExpandMore } from 'react-icons/md';
import { useState } from 'react';

type Panel = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type CollapsiblePanelsProps = {
  panels: Panel[];
  onActivePanelChange: (activePanel: string | null) => void;
};

const CollapsiblePanels = ({
  panels,
  onActivePanelChange
}: CollapsiblePanelsProps) => {
  const [activePanel, setActivePanel] = useState<string | null>(panels[0].id);

  const handleClick = (id: string) => {
    setActivePanel(id);
    onActivePanelChange(id);
  };

  return (
    <div className="rounded-lg border border-black ">
      {panels.map(({ id, title, content }) => (
        <div key={id}>
          <div
            className={` flex items-center justify-between rounded-lg px-3  py-3 
              ${
                id === activePanel
                  ? 'bg-stone-100 '
                  : 'cursor-pointer text-gray-300 hover:bg-gray-50 hover:text-gray-600 '
              }`}
            onClick={() => handleClick(id)}
          >
            <h2 className="text-sm ">{title}</h2>
            {id === activePanel ? (
              ''
            ) : (
              <MdExpandMore className="text-gray-600" />
            )}
          </div>
          {id === activePanel && (
            <div className="bg-stone-100 p-3 animate-in fade-in-5 duration-1000 ">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollapsiblePanels;
