import Image from 'next/image';
import React from 'react';

type Props = {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileInput: React.FC<Props> = ({ handleImageChange }) => {
  return (
    <label className="focus:border-brand-400 col-span-3 flex cursor-pointer appearance-none items-center rounded-md py-2 text-sm font-bold text-gray-700 focus:outline-none">
      Change profile image
      <input
        className="hidden"
        name="cover"
        id="cover"
        accept=".png, .jpg, .jpeg"
        type="file"
        onChange={handleImageChange}
      />
    </label>
  );
};

export default FileInput;
