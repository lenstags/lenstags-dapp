import { useState, ChangeEvent } from 'react';
import Link from 'next/link';

export interface CachedName {
  id: string;
  name: string;
  type: string;
}

export const SearchBar = ({ cachedNames }: { cachedNames: CachedName[] }) => {
  const [inputText, setInputText] = useState<string>('');

  const handleInputText = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const filteredNames = cachedNames.filter((publication) => {
    const regex = new RegExp(inputText, 'i');
    return publication.name.match(regex);
  });

  return (
    <div className="relative">
      <div className="flex justify-start">
        <input
          type="text"
          autoComplete="off"
          value={inputText}
          onChange={handleInputText}
          onBlur={() => setInputText('')}
          className="rounded-full
        bg-stone-100 p-3
        leading-none outline-none  md:w-1/3"
          name="tag-search-input"
          id="tag-search-input"
          // onKeyDown={handleKeyDown}
          placeholder="🔍 Search..."
        />
        <button
          className="ml-2 hidden rounded-lg border  border-solid border-black bg-stone-100
        p-2"
        >
          <svg
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 3L19 3M1 3L10 3M1 15L10 15M1 9H6M10 9H19M14 15H19M14 1V5M6 7V11M14 13V17"
              stroke="#4D4D4D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {inputText !== '' && (
        <div className="absolute md:w-1/3 z-[10000]">
          <ul className="bg-white max-w-[94%] ml-2 p-2 rounded-md">
            {filteredNames
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.type}/${item.id}`}
                  /* rel="noopener noreferrer"
                  target="_blank" */
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  <li className="hover:font-semibold">{item.name}</li>
                </Link>
              ))
              .slice(0, 3)}
          </ul>
        </div>
      )}
    </div>
  );
};
