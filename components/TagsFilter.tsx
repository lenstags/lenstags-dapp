import CreatableSelect from 'react-select/creatable';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';
import { useContext } from 'react';
import { useState } from 'react';

const selectedStyle = 'bg-lensGreen text-black border-black shadow';

// TODO Improve UI when there are too many tags for two lines
export const TagsFilter = () => {
  const { setTags } = useContext(TagsFilterContext);

  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
    setTags(selectedOptions.map((t: any) => t.value));
  };

  return (
    <div className=" relative  z-10 mb-4 flex h-auto w-full items-baseline rounded-lg bg-stone-100  py-2 ">
      <span className="ml-4 font-serif">Tags</span>
      <div className="w-full border-0 pl-4 ">
        <CreatableSelect
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              boxShadow: 'none',
              backgroundColor: 'transparent',
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
