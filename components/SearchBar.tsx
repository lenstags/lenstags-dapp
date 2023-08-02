import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  ProfileSearchResult,
  PublicationSearchResult
} from '@lib/lens/graphql/generated';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { search } from '@lib/lens/graphql/search';
import { Spinner } from './Spinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface UserSearchType {
  id: string;
  handle: string;
  name: string;
  profilePicture: string;
}

export interface PublicationSearchType {
  id: string;
  type: string;
  name: string;
  profilePicture: string;
  profileName: string;
  profileHandle: string;
  image: string;
  tags: string[];
  content: string;
  createdAt: string;
  totalAmountOfComments: number;
  totalAmountOfCollects: number;
}

export const fetchData = async (input: string, limit: number = 5) => {
  const res = await search(input, limit);

  const resUsers = (await res.profilesData) as ProfileSearchResult;
  const users = resUsers.items.map((user: any) => {
    return {
      id: user.id,
      handle: user.handle,
      name: user.name,
      profilePicture: user.picture?.original.url
    };
  });

  const resPublications =
    (await res.publicationsData) as PublicationSearchResult;
  const publications = resPublications.items.map((publication: any) => {
    return {
      id: publication.id,
      type: publication.metadata.attributes[0].value,
      name: publication.metadata.name,
      profilePicture: publication.profile.picture.original.url,
      profileName: publication.profile.name,
      profileHandle: publication.profile.handle,
      image: publication.metadata.media[0]?.original.url,
      tags: publication.metadata.tags,
      content: publication.metadata.content,
      createdAt: publication.createdAt,
      totalAmountOfComments: publication.stats.totalAmountOfComments,
      totalAmountOfCollects: publication.stats.totalAmountOfCollects
    };
  });

  return { users, publications };
};

export const SearchBar = () => {
  const [inputText, setInputText] = useState<string>('');
  const [cachedUsers, setCachedUsers] = useState<UserSearchType[]>([]);
  const [cachedPublications, setCachedPublications] = useState<
    PublicationSearchType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputText = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);

    if (event.target.value === '') {
      setCachedPublications([]);
      setCachedUsers([]);
    }
  };

  const clearInput = () => {
    setInputText('');
    setCachedPublications([]);
    setCachedUsers([]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      router.push(`/search?q=${inputText}`);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      clearInput();
    } else if (event.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.blur();
      }
      clearInput();
    }
  };

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      if (inputText) {
        const fetchAndSetUsers = async () => {
          setIsLoading(true);
          const data = await fetchData(inputText);
          setCachedUsers(data.users);
          setCachedPublications(data.publications);
          setIsLoading(false);
        };

        fetchAndSetUsers();
      }
    }, 100);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [inputText]);

  return (
    <div className="relative">
      <div className="flex justify-start items-center bg-stone-100 py-3 px-5 rounded-full border-black border-[1px] md:w-1/2">
        <MagnifyingGlassIcon className="w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          value={inputText}
          onChange={handleInputText}
          onBlur={() => clearInput()}
          className="bg-stone-100 outline-none leading-none ml-2"
          name="tag-search-input"
          id="tag-search-input"
          onKeyDown={handleKeyDown}
          placeholder="Search..."
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
      {inputText !== '' &&
      cachedPublications.length === 0 &&
      cachedUsers.length === 0 ? (
        <div className="absolute z-[10000] flex justify-center rounded-md bg-stone-100 px-4 py-3 mt-2 border-black border-[1px] md:w-1/2">
          {isLoading ? (
            <Spinner w="4" h="4" />
          ) : (
            <span>Sorry, no matches. Keep searching!</span>
          )}
        </div>
      ) : (
        (cachedPublications.length > 0 || cachedUsers.length > 0) && (
          <div className="absolute z-[10000] flex flex-col rounded-md bg-stone-100 px-4 py-3 mt-2 border-black border-[1px] md:w-1/2">
            {cachedPublications.length > 0 && (
              <div className="flex flex-col mb-1">
                <span className="font-semibold">Recommended</span>
                <ul>
                  {cachedPublications
                    .map((publication: PublicationSearchType) => (
                      <Link
                        key={publication.id}
                        href={`/${publication.type}/${publication.id}`}
                        /* rel="noopener noreferrer"
                    target="_blank" */
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.preventDefault()}
                      >
                        <li className="truncate hover:underline">
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
                <span className="font-semibold">Creators</span>
                <ul>
                  {cachedUsers
                    .map((user: UserSearchType) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        /* rel="noopener noreferrer"
                    target="_blank" */
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.preventDefault()}
                      >
                        <li className="hover:underline">{user.handle}</li>
                      </Link>
                    ))
                    .slice(0, 3)}
                </ul>
              </div>
            )}
            <Link
              href={`/search?q=${inputText}`}
              className="self-center hover:underline"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
            >
              See all results
            </Link>
          </div>
        )
      )}
    </div>
  );
};
