import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  ProfileSearchResult,
  PublicationSearchResult
} from '@lib/lens/graphql/generated';

import Link from 'next/link';
import { search } from '@lib/lens/graphql/search';

interface User {
  id: string;
  handle: string;
}

interface Publication {
  id: string;
  type: string;
  name: string;
}

export const SearchBar = () => {
  const [inputText, setInputText] = useState<string>('');
  const [cachedUsers, setCachedUsers] = useState<User[]>([]);
  const [cachedPublications, setCachedPublications] = useState<Publication[]>(
    []
  );
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleInputText = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  /* const filteredUsers = cachedUsers.filter((user: any) => {
    const regex = new RegExp(inputText, 'i');
    return user.name.match(regex);
  }); */

  const fetchData = async (input: string) => {
    const res = await search(input);

    const resUsers = (await res.profilesData) as ProfileSearchResult;
    const users = resUsers.items.map((user: any) => {
      return {
        id: user.id,
        handle: user.handle
      };
    });

    const arrPublications =
      (await res.publicationsData) as PublicationSearchResult;
    const publications = arrPublications.items.map((publication: any) => {
      return {
        id: publication.id,
        type: publication.metadata.attributes[0].value,
        name: publication.metadata.name
      };
    });

    return { users, publications };
  };

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      if (inputText) {
        const fetchAndSetUsers = async () => {
          const data = await fetchData(inputText);
          setCachedUsers(data.users);
          setCachedPublications(data.publications);
        };

        fetchAndSetUsers();
      }
    }, 500);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [inputText]);

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
        <div className="absolute z-[10000] flex flex-col rounded-md bg-white px-3 py-2 md:w-1/3">
          {cachedPublications.length > 0 && (
            <div className="flex flex-col">
              <span className="underline">Content</span>
              <ul>
                {cachedPublications
                  .map((publication: Publication) => (
                    <Link
                      key={publication.id}
                      href={`/${publication.type}/${publication.id}`}
                      /* rel="noopener noreferrer"
                    target="_blank" */
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                    >
                      <li className="hover:font-semibold">
                        {publication.name}
                      </li>
                    </Link>
                  ))
                  .slice(0, 3)}
              </ul>
            </div>
          )}
          {cachedUsers.length > 0 && (
            <div className="flex flex-col">
              <span className="underline">Users</span>
              <ul>
                {cachedUsers
                  .map((user: User) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      /* rel="noopener noreferrer"
                    target="_blank" */
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                    >
                      <li className="hover:font-semibold">{user.handle}</li>
                    </Link>
                  ))
                  .slice(0, 3)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
