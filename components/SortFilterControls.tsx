import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import {
  Squares2X2Icon,
  QueueListIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { PublicationSortCriteria } from '@lib/lens/graphql/generated';

export interface SortingValuesType {
  date: string;
  sort: PublicationSortCriteria;
  by: string;
}

enum ViewBy {
  CARD = 'CARD',
  VIEW = 'VIEW',
  POST = 'POST'
}

export enum Filter {
  ALL = 'ALL',
  LISTS = 'LISTS',
  POSTS = 'POSTS'
}

export const SortFilterControls = ({
  sortingValues,
  setSortingValues,
  filterValue,
  setFilterValue
}: {
  sortingValues: SortingValuesType;
  setSortingValues: ({}: SortingValuesType) => void;
  filterValue: Filter;
  setFilterValue: (Filter: Filter) => void;
}) => {
  const [showSortingOptions, setShowSortingOptions] = useState(false);
  const [localValues, setLocalValues] = useState(sortingValues);
  const [viewCard, setViewCard] = useState<ViewBy>(ViewBy.CARD);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const Pill = () => {
    switch (viewCard) {
      case ViewBy.CARD:
        return <Squares2X2Icon className="w-6 h-6" />;
      case ViewBy.POST:
        return <QueueListIcon className="w-6 h-6" />;
      case ViewBy.VIEW:
        return <RectangleStackIcon className="w-6 h-6" />;
    }
  };

  const handleViewOptionClick = (view: ViewBy) => {
    setViewCard(view);
    setTimeout(() => {
      setShowViewOptions(false);
    }, 200);
  };

  const handleSortingOptionClick = (group: string, value: string) => {
    setLocalValues({
      ...localValues,
      [group]: value
    });
  };

  const handleApplyClick = () => {
    setSortingValues(localValues);
    setShowSortingOptions(false);
  };

  return (
    <div className="flex flex-col">
      <div className="mt-2 flex justify-between rounded-t-lg min-h-[3rem]">
        <div className="flex gap-1 font-sans font-medium tracking-wide items-center">
          <button
            onClick={() => setFilterValue(Filter.ALL)}
            className={`rounded-lg border
          border-solid border-black px-4 py-1 align-middle 
          font-semibold ${
            filterValue === Filter.ALL
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}
          >
            All
          </button>

          <button
            onClick={() => setFilterValue(Filter.LISTS)}
            className={`rounded-lg
          border border-solid border-black px-4 py-1
          align-middle font-semibold ${
            filterValue === Filter.LISTS
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}
          >
            Lists
          </button>

          <button
            onClick={() => setFilterValue(Filter.POSTS)}
            className={`rounded-lg
          border border-solid border-black px-4 py-1
          align-middle font-semibold ${
            filterValue === Filter.POSTS
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}
          >
            Posts
          </button>
        </div>
        <div className="flex gap-1 items-center font-sans font-medium tracking-wide">
          <button
            onClick={() => setShowSortingOptions(!showSortingOptions)}
            className={`py-1 px-1.5 rounded-lg
          border-black border border-solid 
          ${showSortingOptions ? 'bg-black' : 'bg-white'}`}
          >
            {showSortingOptions ? (
              <AdjustmentsHorizontalIcon className="text-white w-6 h-6" />
            ) : (
              <AdjustmentsHorizontalIcon className="text-black w-6 h-6" />
            )}
          </button>
          {showViewOptions ? (
            <div className="flex space-x-2 py-1 px-1.5 shadow rounded-lg">
              {viewCard === ViewBy.CARD ? (
                <button
                  className="bg-black text-white py-1 px-1.5 rounded-lg"
                  onClick={() => handleViewOptionClick(ViewBy.CARD)}
                >
                  <Squares2X2Icon className="w-6 h-6" />
                </button>
              ) : (
                <button
                  className="bg-white text-black py-1 px-1.5"
                  onClick={() => handleViewOptionClick(ViewBy.CARD)}
                >
                  <Squares2X2Icon className="w-6 h-6" />
                </button>
              )}
              {viewCard === ViewBy.POST ? (
                <button
                  className="bg-black text-white py-1 px-1.5 rounded-lg"
                  onClick={() => handleViewOptionClick(ViewBy.POST)}
                >
                  <QueueListIcon className="w-6 h-6" />
                </button>
              ) : (
                <button
                  className="bg-white text-black py-1 px-1.5"
                  onClick={() => handleViewOptionClick(ViewBy.POST)}
                >
                  <QueueListIcon className="w-6 h-6" />
                </button>
              )}
              {viewCard === ViewBy.VIEW ? (
                <button
                  className="bg-black text-white py-1 px-1.5 rounded-lg"
                  onClick={() => handleViewOptionClick(ViewBy.VIEW)}
                >
                  <RectangleStackIcon className="w-6 h-6" />
                </button>
              ) : (
                <button
                  className="bg-white text-black py-1 px-1.5"
                  onClick={() => handleViewOptionClick(ViewBy.VIEW)}
                >
                  <RectangleStackIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowViewOptions(true)}
              className="py-1 px-1.5 rounded-lg
          border-black border border-solid 
          bg-white"
            >
              <Pill />
            </button>
          )}
        </div>
      </div>
      {showSortingOptions && (
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
                  onChange={() => handleSortingOptionClick('date', 'today')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('date', 'today')}
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
                  onChange={() => handleSortingOptionClick('date', 'lastWeek')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('date', 'lastWeek')}
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
                  onChange={() => handleSortingOptionClick('date', 'lastMonth')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('date', 'lastMonth')}
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
                  onChange={() => handleSortingOptionClick('date', 'all')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('date', 'all')}
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
                    handleSortingOptionClick(
                      'sort',
                      PublicationSortCriteria.Latest
                    )
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleSortingOptionClick(
                      'sort',
                      PublicationSortCriteria.Latest
                    )
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
                    handleSortingOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCollected
                    )
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleSortingOptionClick(
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
                    handleSortingOptionClick(
                      'sort',
                      PublicationSortCriteria.TopCommented
                    )
                  }
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() =>
                    handleSortingOptionClick(
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
                  onChange={() => handleSortingOptionClick('by', 'all')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('by', 'all')}
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
                  onChange={() => handleSortingOptionClick('by', 'curators')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('by', 'curators')}
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
                  onChange={() => handleSortingOptionClick('by', 'projects')}
                  className="peer sr-only"
                />
                <div
                  className="w-3 h-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:ring-black peer-checked:bg-black peer-checked:border-white"
                  onClick={() => handleSortingOptionClick('by', 'projects')}
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
