import { useContext } from 'react';
import { useState } from 'react';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';
import CreatableSelect from 'react-select/creatable';

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

  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selectedOptions: any) => {
    toggleSelected(selectedOptions);
  };



  return (

    <div className="input-translate flex  w-full place-items-baseline justify-between rounded-lg border-2 border-lensBlack bg-white px-6">
      <div>
        <p className="font-semibold">Tags</p>
      </div>
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

    /*
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
    */
  );
};
