import {
  Filter,
  SortFilterControls,
  SortingValuesType
} from '@components/SortFilterControls';
import { Layout, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import { NextPage } from 'next';
import { PublicationSortCriteria } from '@lib/lens/graphql/generated';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';
import { useExplore } from '@context/ExploreContext';

const Lists: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [sortingValues, setSortingValues] = useState<SortingValuesType>({
    date: 'all',
    sort: PublicationSortCriteria.Latest,
    by: 'all'
  });
  const [filterValue, setFilterValue] = useState<Filter>(Filter.ALL);

  const { tags } = useContext(TagsFilterContext);

  useEffect(() => {
    explore({ locale: 'en', sortingValues, filterValue, tags }).then((data) => {
      if (data.__typename === 'ExplorePublicationResult') {
        const filteredItems = data.items.filter(
          (r: any) => r.metadata.attributes[0].value === 'list'
        );
        setPublications(filteredItems);
      }
    });
  }, [tags, sortingValues, filterValue]);

  const { isExplore, setIsExplore, skipExplore, setSkipExplore } = useExplore();

  //explore({ locale: 'en', tags });
  return (
    <Layout
      title="Nata Social | Explore"
      pageDescription="Explore"
      screen={true}
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      <div className="container mx-auto w-11/12  py-10 md:w-4/5  ">
        <div className="mb-3">
          <TagsFilter />
          <SortFilterControls
            sortingValues={sortingValues}
            setSortingValues={setSortingValues}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        </div>
        <div className="h-auto w-full">{/* <Pagination /> */}</div>
      </div>
      <div className="text-center text-2xl">My lists</div>
      <div className="container mx-auto">
        <div className="  flex flex-wrap  ">
          {publications
            ? publications.map((post, index) => (
                <ExplorerCard post={post} key={index} />
              ))
            : null}
        </div>
      </div>
    </Layout>
  );
};

export default Lists;
