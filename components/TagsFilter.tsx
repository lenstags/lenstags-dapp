import { useContext } from 'react';
import { useState } from 'react';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';

const selectedStyle = 'bg-greenLengs text-black border-black shadow';

// TODO Improve UI when there are too many tags for two lines
export const TagsFilter = () => {
  const [selected, setSelected] = useState<boolean[]>([]);
  const { setTags } = useContext(TagsFilterContext);

  const toggleSelected = (index: number) => {
    const newSelected = [...selected];
    newSelected[index] = !selected[index];
    setSelected(newSelected);

    const tags = TAGS.map((tag) => tag.value).filter(
      (_, index) => newSelected[index]
    );

    setTags(tags);
  };

  return (
    <div className="text-zinc-400 flex gap-2 text-xs flex-wrap max-h-16 overflow-hidden">
      {TAGS.map((tag, index) => (
        <span
          className={`${
            selected[index] ? selectedStyle : 'border-zinc-400'
          } px-2 py-1 whitespace-nowrap flex-1 flex justify-center cursor-pointer select-none border`}
          key={index}
          onClick={() => toggleSelected(index)}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
};
