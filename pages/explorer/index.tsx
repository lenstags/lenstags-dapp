import { Layout, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';

const Explorer: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);

  const { tags } = useContext(TagsFilterContext);

  useEffect(() => {
    explore({ tags }).then((data) => setPublications(data.items));
  }, [tags]);

  explore({ tags });
  return (
    <Layout title="Lenstags | Explore" pageDescription="Explore" screen={true}>
      <div className="container mx-auto w-11/12  py-10 md:w-4/5  ">
        <div className="mb-3">
          <TagsFilter />
        </div>

        <div className="h-auto w-full">{/* <Pagination /> */}</div>
      </div>
      <div className="container mx-auto px-4 md:px-12">
        <div className="-mx-1 flex flex-wrap lg:-mx-4">
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

export default Explorer;
