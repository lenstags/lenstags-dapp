import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { PublicationSortCriteria } from '@lib/lens/graphql/generated';

export interface SortingValuesType {
  date: string;
  sort: PublicationSortCriteria;
  by: string;
}

export const SortingOptions = ({
  sortingValues,
  setSortingValues
}: {
  sortingValues: SortingValuesType;
  setSortingValues: ({}: SortingValuesType) => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [localValues, setLocalValues] = useState(sortingValues);

  const handleOptionClick = (group: string, value: string) => {
    setLocalValues({
      ...localValues,
      [group]: value
    });
  };

  const handleApplyClick = () => {
    setSortingValues(localValues);
    setShowOptions(false);
  };

  return (
    <div className="flex flex-col">
      <div className="mt-2 flex justify-between rounded-t-lg  py-2">
        <div className="flex  gap-1  font-sans font-medium tracking-wide">
          <button
            // onClick={fetchContentAll}
            className="rounded-lg border
          border-solid border-black px-4 py-1 align-middle 
          text-white font-semibold"
          >
            All
          </button>

          <button
            // onClick={openConnectModal}
            className="rounded-lg
          border border-solid border-black bg-white px-4 py-1
          align-middle text-black font-semibold"
          >
            Lists
          </button>

          <button
            // onClick={openConnectModal}
            className="rounded-lg
          border border-solid border-black bg-white px-4 py-1
          align-middle text-black font-semibold"
          >
            Posts
          </button>
        </div>
        <div className="flex gap-1  font-sans font-medium tracking-wide">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="py-1 px-1.5 rounded-lg
          border-black border border-solid 
          bg-white"
          >
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
          </button>

          <button
            // onClick={openConnectModal}
            className="py-1 px-1.5 rounded-lg
          border-black border border-solid 
          bg-white"
          >
            <Squares2X2Icon className="w-6 h-6" />
          </button>
        </div>
      </div>
      {showOptions && (
        <div className="flex flex-col bg-[#F8F8F8] rounded-lg border border-black py-4 px-6 my-2">
          <div className="flex space-x-40">
            <div className="flex flex-col space-y-1">
              <span className="font-serif font-bold text-sm mb-1.5">
                Upload date
              </span>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="date"
                  value="today"
                  id="dateToday"
                  checked={localValues.date === 'today'}
                  onChange={() => handleOptionClick('date', 'today')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('date', 'today')}
                ></div>
                <label htmlFor="dateToday" className="ml-1.5 text-xs">
                  Today
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="date"
                  value="lastWeek"
                  id="dateLastWeek"
                  checked={localValues.date === 'lastWeek'}
                  onChange={() => handleOptionClick('date', 'lastWeek')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('date', 'lastWeek')}
                ></div>
                <label htmlFor="dateWeek" className="ml-1.5 text-xs">
                  Last Week
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="date"
                  value="lastMonth"
                  id="dateLastMonth"
                  checked={localValues.date === 'lastMonth'}
                  onChange={() => handleOptionClick('date', 'lastMonth')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('date', 'lastMonth')}
                ></div>
                <label htmlFor="dateLastMonth" className="ml-1.5 text-xs">
                  Last Month
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="date"
                  value="all"
                  id="dateAll"
                  checked={localValues.date === 'all'}
                  onChange={() => handleOptionClick('date', 'all')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('date', 'all')}
                ></div>
                <label htmlFor="dateAll" className="ml-1.5 text-xs">
                  All
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="font-serif font-bold text-sm mb-1.5">
                Sort by
              </span>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="newest"
                  id="sortNewest"
                  checked={localValues.sort === PublicationSortCriteria.Latest}
                  onChange={() =>
                    handleOptionClick('sort', PublicationSortCriteria.Latest)
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleOptionClick('sort', PublicationSortCriteria.Latest)
                  }
                ></div>
                <label htmlFor="sortNewest" className="ml-1.5 text-xs">
                  Newest
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="mostCollected"
                  id="sortMostCollected"
                  checked={
                    localValues.sort === PublicationSortCriteria.TopCollected
                  }
                  onChange={() =>
                    handleOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCollected
                    )
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCollected
                    )
                  }
                ></div>
                <label htmlFor="sortMostCollected" className="ml-1.5 text-xs">
                  Most Collected
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  value="mostCommented"
                  id="sortMostCommented"
                  checked={
                    localValues.sort === PublicationSortCriteria.TopCommented
                  }
                  onChange={() =>
                    handleOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCommented
                    )
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCommented
                    )
                  }
                ></div>
                <label htmlFor="sortMostCommented" className="ml-1.5 text-xs">
                  Most Commented
                </label>
              </div>
            </div>
            <div className="flex-col space-y-1 hidden">
              <span className="font-serif font-bold text-sm mb-1.5">By</span>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="by"
                  value="all"
                  id="byAll"
                  checked={localValues.by === 'all'}
                  onChange={() => handleOptionClick('by', 'all')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('by', 'all')}
                ></div>
                <label htmlFor="byAll" className="ml-1.5 text-xs">
                  All
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="by"
                  value="curators"
                  id="byCurators"
                  checked={localValues.by === 'curators'}
                  onChange={() => handleOptionClick('by', 'curators')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('by', 'curators')}
                ></div>
                <label htmlFor="byCurators" className="ml-1.5 text-xs">
                  Curators
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="by"
                  value="projects"
                  id="byProjects"
                  checked={localValues.by === 'projects'}
                  onChange={() => handleOptionClick('by', 'projects')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleOptionClick('by', 'projects')}
                ></div>
                <label htmlFor="byProjects" className="ml-1.5 text-xs">
                  Projects
                </label>
              </div>
            </div>
          </div>
          <button
            className="self-end text-white px-3 py-1 font-semibold text-xs mt-1.5"
            onClick={handleApplyClick}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
