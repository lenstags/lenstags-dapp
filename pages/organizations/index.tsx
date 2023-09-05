import { Layout } from 'components';
import { NextPage } from 'next';
import { useExplore } from '@context/ExploreContext';

const Organizations: NextPage = () => {
  const { setIsExplore, isExplore, setSkipExplore, skipExplore } = useExplore();
  return (
    <Layout
      title="Nata Social | Organizations"
      pageDescription="Organizations"
      setIsExplore={setIsExplore}
      isExplore={isExplore}
      setSkipExplore={setSkipExplore}
      skipExplore={skipExplore}
    >
      <h1 style={{ color: 'red' }}>Organizations</h1>
    </Layout>
  );
};

export default Organizations;
