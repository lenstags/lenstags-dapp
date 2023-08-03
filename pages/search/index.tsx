import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Layout } from '@components/Layout';
import {
  fetchData,
  UserSearchType,
  PublicationSearchType,
  SearchBar
} from '@components/SearchBar';
import { Spinner } from '@components/Spinner';
import { TagsFilter } from '@components/TagsFilter';
import { ResultsCard } from '@components/ui/search/ResultsCard';
import { ProfileCard } from '@components/ui/search/ProfileCard';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useSearchResultsStore } from '@lib/hooks/use-search-results-store';

export interface Data {
  users: UserSearchType[];
  publications: PublicationSearchType[];
}

const Search = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const { query } = useRouter();
  const searchData = useSearchResultsStore();

  useEffect(() => {
    if (searchData.query === query.q) {
      setIsLoading(true);
      setData(searchData.searchResults);
      setIsLoading(false);
    } else {
      if (query.q) {
        const fetchDataFunction = async () => {
          setIsLoading(true);
          const res = await fetchData(query.q as string, 10);
          setData(res);
          setIsLoading(false);
        };

        fetchDataFunction();
      }
    }
  }, [query.q]);

  return (
    <Layout
      title={`Nata Social | Search results for "${query.q}"`}
      pageDescription={'Search results'}
    >
      <>
        <div className="h-50 top-0 z-10 w-full bg-white px-8 pt-4">
          <SearchBar />
          <TagsFilter />
        </div>
        <div className="flex flex-col min-w-full px-8">
          {isLoading ? (
            <div className="flex min-w-full justify-center my-8">
              <Spinner h="8" w="8" />
            </div>
          ) : (
            <>
              {data!.publications.length > 0 && (
                <div className="flex flex-col min-w-full mb-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-3xl font-bold">Results</h2>
                    <div className="flex items-center font-semibold">
                      <span className="mr-2">View all</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    {data!.publications.map((publication) => (
                      <ResultsCard
                        key={publication.id}
                        publication={publication}
                      />
                    ))}
                  </div>
                </div>
              )}
              {data!.users.length > 0 && (
                <div className="flex flex-col min-w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-3xl font-bold">Profiles</h2>
                    <div className="flex items-center font-semibold">
                      <span className="mr-2">View all</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-y-4">
                    {data!.users.map((user) => (
                      <ProfileCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </>
    </Layout>
  );
};

export default Search;
