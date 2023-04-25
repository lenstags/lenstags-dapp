import React, { useState } from 'react';
import { Tag, TAGS } from '@lib/lens/tags';
import CreatableSelect from 'react-select/creatable';

interface Props {
  options: Tag[];
  onSelect: (value: string) => void;
}

const TagsSelector: React.FC<Props> = ({ onSelect }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const handleChange = (selectedOptions: any) => {
    setSelectedValues(selectedOptions);
  };

  return (
    <CreatableSelect
      menuPortalTarget={document.querySelector('body')}
      isMulti
      onChange={handleChange}
      options={TAGS}
    />
  );
};

export default TagsSelector;
