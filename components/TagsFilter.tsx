import { useContext } from 'react';
import { useState } from 'react';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';

const selectedStyle = 'bg-lensGreen text-black border-black shadow';

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
    <div className="flex justify-center">
      <div className=" flex justify-center gap-2 my-4 max-w-7xl text-xs flex-wrap max-h-16 overflow-hidden">
        {TAGS.map((tag, index) => (
          <span
            className={`${
              selected[index]
                ? selectedStyle
                : 'border-lensBlack hover:bg-lensGreen hover:font-semibold font-normal bg-gray-100 rounded-lg border-2'
            } px-2 py-1 whitespace-nowrap flex-1  font-semibold rounded-lg flex justify-center cursor-pointer select-none border-2`}
            key={index}
            onClick={() => toggleSelected(index)}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
};
