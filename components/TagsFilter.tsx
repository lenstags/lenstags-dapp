import CreatableSelect from 'react-select/creatable';
import { TAGS } from '../lib/lens/tags';
import { TagsFilterContext } from './TagsFilterProvider';
import { useContext } from 'react';
import { useState } from 'react';
import { cn } from '@lib/utils';

const selectedStyle = 'bg-lensGreen text-black border-black shadow';

interface TagProps {
  className?: string;
}

// TODO Improve UI when there are too many tags for two lines
export const TagsFilter: React.FC<TagProps> = ({ className = 'mt-4' }) => {
  const { setTags } = useContext(TagsFilterContext);

  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selectedOptions: any) => {
    setSelectedOption(selectedOptions);
    setTags(selectedOptions.map((t: any) => t.value));
  };

  return (
    <div
      className={cn(
        'flex w-full items-baseline rounded-lg bg-stone-100',
        className
      )}
    >
      <span className="ml-4 font-serif">Tags</span>
      <div className="w-full  border-0 pl-4 ">
        <CreatableSelect
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              zIndex: 10,
              boxShadow: 'none',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              '&:hover': {
                borderColor: 'transparent'
              }
            })
          }}
          isMulti
          onChange={handleChange}
          options={TAGS}
        />
      </div>
    </div>
  );
};
