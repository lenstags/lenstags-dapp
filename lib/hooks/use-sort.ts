import { SortBy } from 'models';
interface sortItemsProps {
  items: any[];
  sort: string;
}

export function useSorts() {
  const sortItems = ({ items, sort }: sortItemsProps) => {
    console.log(items, sort);
    return items.sort((a, b) => {
      if (sort === SortBy.ALPHABETICAL) {
        return a.metadata.name.localeCompare(b.metadata.name);
      } else if (sort === SortBy.NEWEST) {
        const timeA = new Date(a.createdAt).valueOf();
        const timeB = new Date(b.createdAt).valueOf();
        return timeB - timeA;
      } else if (sort === SortBy.MOSTCOLLECTED) {
        return b.stats.totalAmountOfCollects - a.stats.totalAmountOfCollects;
      }

      return 0;
    });
  };

  return { sortItems };
}

export function useListSorts() {
  const sortItems = ({ items, sort }: sortItemsProps) => {
    console.log(items, sort);
    return items.sort((a, b) => {
      if (sort === SortBy.ALPHABETICAL) {
        return a.name?.localeCompare(b?.name);
      } else if (sort === SortBy.NEWEST) {
        const timeA = new Date(a.createdAt).valueOf();
        const timeB = new Date(b.createdAt).valueOf();
        return timeB - timeA;
      } else if (sort === SortBy.MOSTCOLLECTED) {
        return b.stats.totalAmountOfCollects - a.stats.totalAmountOfCollects;
      }

      return 0;
    });
  };

  return { sortItems };
}
