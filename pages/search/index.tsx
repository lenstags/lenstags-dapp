import {
  PublicationSearchType,
  SearchBar,
  UserSearchType,
  fetchData
} from '@components/SearchBar';
import { useContext, useEffect, useState } from 'react';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Layout } from '@components/Layout';
import ModalLists from '@components/ModalLists';
import { PostProcessStatus } from 'utils/helpers';
import { ProfileCard } from '@components/search/ProfileCard';
import { ProfileContext } from '@components/LensAuthenticationProvider';
import { ResultsCard } from '@components/search/ResultsCard';
import { Spinner } from '@components/Spinner';
import { TagsFilter } from '@components/TagsFilter';
import { useRouter } from 'next/router';
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
  const { profile: lensProfile } = useContext(ProfileContext);
  const [isPosting, setIsPosting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

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

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const [post, setPost] = useState<any>(null);
  const handleOpenModal = (postId: string, post: any) => {
    setPostId(postId);
    setPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProcessStatus = (actualStatus: PostProcessStatus) => {
    if (
      actualStatus === PostProcessStatus.CREATING_LIST ||
      actualStatus === PostProcessStatus.COLLECTING_POST ||
      actualStatus === PostProcessStatus.ADDING_POST ||
      actualStatus === PostProcessStatus.INDEXING
    ) {
      setIsPosting(true);
    }

    if (actualStatus === PostProcessStatus.FINISHED) {
      setIsPosting(false);
      setIsFinished(true);
    }
    // TODO error-unauthenticated//
  };

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
        <ModalLists
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          postId={postId}
          processStatus={handleProcessStatus}
          ownedBy={post?.ownedBy}
          isList={post?.isList}
          post={post}
        />
        <div className="flex min-w-full flex-col px-8">
          {isLoading ? (
            <div className="my-8 flex min-w-full justify-center">
              <Spinner h="8" w="8" />
            </div>
          ) : (
            <>
              {data!.publications.length > 0 && (
                <div className="mb-10 flex min-w-full flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-3xl font-bold">Results</h2>
                    <div className="flex items-center font-semibold">
                      <span className="mr-2">View all</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    {data!.publications.map((publication) => (
                      <ResultsCard
                        key={publication.id}
                        publication={publication}
                        profile={lensProfile}
                        isFinishedState={isFinished}
                        isPostingState={isPosting}
                        openModalHandler={handleOpenModal}
                      />
                    ))}
                  </div>
                </div>
              )}
              {data!.users.length > 0 && (
                <div className="mb-10 flex min-w-full flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-3xl font-bold">Profiles</h2>
                    <div className="flex items-center font-semibold">
                      <span className="mr-2">View all</span>
                      <ArrowRightIcon className="h-4 w-4" />
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
