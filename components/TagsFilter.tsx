import CreatableSelect from 'react-select/creatable';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';
import { useContext } from 'react';
import { useState } from 'react';

const selectedStyle = 'bg-lensGreen text-black border-black shadow';

// TODO Improve UI when there are too many tags for two lines
export const TagsFilter = () => {
  const [selected, setSelected] = useState<boolean[]>([]);
  const { setTags } = useContext(TagsFilterContext);

  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
    setTags(selectedOptions.map((t: any) => t.value));
  };

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
    <div className="lens-input z-20 my-4 flex ">
      {/* <div className="flex justify-center">
        <div className=" my-4 flex max-h-16 max-w-7xl flex-wrap justify-center gap-2 overflow-hidden text-xs">
          {TAGS.map((tag, index) => (
            <span
              className={`${
                selected[index]
                  ? selectedStyle
                  : 'rounded-lg border-2 border-lensBlack bg-gray-100 font-normal hover:bg-lensGreen hover:font-semibold'
              } flex flex-1 cursor-pointer select-none  justify-center whitespace-nowrap rounded-lg border-2 px-2 py-1 font-semibold`}
              key={index}
              onClick={() => toggleSelected(index)}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div> */}

      <span className="ml-4 font-semibold">Tags</span>
      <div className="w-full border-0 pl-4 ">
        <CreatableSelect
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              boxShadow: 'none',
              borderColor: 'transparent',
              '&:hover': {
                borderColor: 'transparent'
              }
            })
          }}
          menuPortalTarget={document.querySelector('body')}
          isMulti
          onChange={handleChange}
          options={TAGS}
        />
      </div>
    </div>
  );
};
