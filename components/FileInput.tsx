import React from 'react';

type Props = {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileInput: React.FC<Props> = ({ handleImageChange }) => {
  return (
    <label
      className="focus:border-brand-400 col-span-3 cursor-pointer appearance-none rounded-md border border-gray-300
       bg-gray-100
     px-4  py-2 text-sm
     text-gray-700 shadow-md focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <div className="flex items-center">
        <img
          className="mr-2"
          src="/assets/icons/addFile.svg"
          alt="Choose file"
          width={20}
          height={20}
        />
        Choose File
        <input
          className="hidden"
          name="cover"
          id="cover"
          accept=".png, .jpg, .jpeg"
          type="file"
          onChange={handleImageChange}
        />
      </div>
    </label>
  );
};

export default FileInput;
