import { Layout } from '@components/Layout';
import { GetServerSideProps } from 'next';
import {
  fetchData,
  UserSearchType,
  PublicationSearchType
} from '@components/SearchBar';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const input = query.q || '';

  const data = await fetchData(input as string);

  return {
    props: {
      input,
      data
    }
  };
};

const Search = ({
  input,
  data
}: {
  input: string;
  data: { users: UserSearchType[]; publications: PublicationSearchType[] };
}) => {
  return (
    <Layout
      title={`Nata Social | Search results for "${input}"`}
      pageDescription={'Search results'}
    >
      {data.publications.map((publication) => publication.name)}
    </Layout>
  );
};

export default Search;
