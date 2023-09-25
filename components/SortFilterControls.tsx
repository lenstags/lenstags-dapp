import {
  QueueListIcon,
  RectangleStackIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { ViewBy, ViewCardContext } from '@context/ViewCardContext';
import { useContext, useEffect, useState } from 'react';

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { PublicationSortCriteria } from '@lib/lens/graphql/generated';

export interface SortingValuesType {
  date: string;
  sort: PublicationSortCriteria;
  by: string;
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
  setFilterValue,
  sorting = true,
  isLoading
}: {
  sortingValues: SortingValuesType;
  setSortingValues: (values: SortingValuesType) => void;
  filterValue: Filter;
  setFilterValue: (Filter: Filter) => void;
  sorting?: boolean;
  isLoading: boolean;
}) => {
  const [showSortingOptions, setShowSortingOptions] = useState(false);
  const [localValues, setLocalValues] = useState(sortingValues);
  const { viewCard, setViewCard } = useContext(ViewCardContext);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const Pill = () => {
    switch (viewCard) {
      case ViewBy.CARD:
        return <Squares2X2Icon className="h-6 w-6" />;
      case ViewBy.LIST:
        return <QueueListIcon className="h-6 w-6" />;
      case ViewBy.POST:
        return <RectangleStackIcon className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const handleViewOptionClick = (
    view: (typeof ViewBy)[keyof typeof ViewBy]
  ) => {
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

  useEffect(() => {
    if (isLoading) {
      setShowSortingOptions(false);
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col">
      <div className="mt-2 flex min-h-[3rem] justify-between rounded-t-lg">
        <div className="flex items-center gap-1 font-sans font-medium tracking-wide">
          <button
            onClick={() => setFilterValue(Filter.ALL)}
            className={`rounded-lg border
          border-solid border-black px-4 py-1 align-middle 
          font-semibold ${
            filterValue === Filter.ALL
              ? 'bg-black text-white'
              : 'bg-white text-black'
          } ${isLoading && 'cursor-not-allowed opacity-50'}`}
            disabled={isLoading}
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
          } ${isLoading && 'cursor-not-allowed opacity-50'}`}
            disabled={isLoading}
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
          } ${isLoading && 'cursor-not-allowed opacity-50'}`}
            disabled={isLoading}
          >
            Posts
          </button>
        </div>
        <div className="flex items-center gap-1 font-sans font-medium tracking-wide">
          {showViewOptions ? (
            <div className="flex space-x-2 rounded-lg px-1.5 py-1 shadow">
              {viewCard === ViewBy.CARD ? (
                <button
                  className="rounded-lg bg-black px-1.5 py-1 text-white"
                  onClick={() => handleViewOptionClick(ViewBy.CARD)}
                >
                  <Squares2X2Icon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  className="bg-white px-1.5 py-1 text-black"
                  onClick={() => handleViewOptionClick(ViewBy.CARD)}
                >
                  <Squares2X2Icon className="h-6 w-6" />
                </button>
              )}
              {viewCard === ViewBy.LIST ? (
                <button
                  className="rounded-lg bg-black px-1.5 py-1 text-white"
                  onClick={() => handleViewOptionClick(ViewBy.LIST)}
                >
                  <QueueListIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  className="bg-white px-1.5 py-1 text-black"
                  onClick={() => handleViewOptionClick(ViewBy.LIST)}
                >
                  <QueueListIcon className="h-6 w-6" />
                </button>
              )}
              {viewCard === ViewBy.POST ? (
                <button
                  className="rounded-lg bg-black px-1.5 py-1 text-white"
                  onClick={() => handleViewOptionClick(ViewBy.POST)}
                >
                  <RectangleStackIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  className="bg-white px-1.5 py-1 text-black"
                  onClick={() => handleViewOptionClick(ViewBy.POST)}
                >
                  <RectangleStackIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowViewOptions(true)}
              className="rounded-lg border border-solid
          border-black bg-white px-1.5 
          py-1"
            >
              <Pill />
            </button>
          )}
          <button
            onClick={() => setShowSortingOptions(!showSortingOptions)}
            className={`rounded-lg border border-solid
          border-black px-1.5 py-1 
          ${showSortingOptions ? 'bg-black' : 'bg-white'} ${
              isLoading && 'cursor-not-allowed opacity-50'
            }`}
            disabled={isLoading}
          >
            {showSortingOptions ? (
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
            ) : (
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-black" />
            )}
          </button>
        </div>
      </div>
      {showSortingOptions && (
        <div className="my-2 flex flex-col rounded-lg border border-black bg-[#F8F8F8] px-6 py-4">
          <div className="flex space-x-40">
            <div className="flex flex-col space-y-1">
              <span className="mb-1.5 font-serif text-sm font-bold">
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
                  onClick={() => handleSortingOptionClick('date', 'all')}
                ></div>
                <label htmlFor="dateAll" className="ml-1.5 text-xs">
                  All
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="mb-1.5 font-serif text-sm font-bold">
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
            <div className="hidden flex-col space-y-1">
              <span className="mb-1.5 font-serif text-sm font-bold">By</span>
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
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
                  className="h-3 w-3 rounded-full border-2 border-gray-500 ring-1 ring-transparent hover:border-black peer-checked:border-white peer-checked:bg-black peer-checked:ring-black"
                  onClick={() => handleSortingOptionClick('by', 'projects')}
                ></div>
                <label htmlFor="byProjects" className="ml-1.5 text-xs">
                  Projects
                </label>
              </div>
            </div>
          </div>
          <button
            className="mt-1.5 self-end px-3 py-1 text-xs font-semibold text-white"
            onClick={handleApplyClick}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
