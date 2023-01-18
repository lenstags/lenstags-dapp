import React, { useState } from 'react';
import { Tag } from '@lib/lens/tags';

interface Props {
  options: Tag[];
  onSelect: (value: string) => void;
}

const TagsSelector: React.FC<Props> = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(options[0].id);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    onSelect(event.target.value);
  };

  return (
    <select value={selectedOption} onChange={handleChange}>
      {options.map((option, index) => (
        <option key={index} value={option.id}>
          {option.title}
        </option>
      ))}
    </select>
  );
};

export default TagsSelector;
