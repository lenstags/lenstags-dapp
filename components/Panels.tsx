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
    <div className="my-4">
      {panels.map(({ id, title, content }) => (
        <div key={id}>
          <div
            className={` mx-4 flex items-center justify-between rounded-lg border-t px-3  py-3 
              ${
                id === activePanel
                  ? 'bg-white '
                  : 'cursor-pointer text-gray-300 hover:bg-gray-50 hover:text-gray-600 '
              }`}
            onClick={() => handleClick(id)}
          >
            <h2 className="text-sm font-semibold">{title}</h2>
            {id === activePanel ? (
              ''
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
