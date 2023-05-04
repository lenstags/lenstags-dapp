import { Layout, ProfileContext, TagsFilter } from 'components';
import { useContext, useEffect, useState } from 'react';

import ExplorerCard from 'components/ExplorerCard';
import { NextPage } from 'next';
import { TagsFilterContext } from 'components';
import { explore } from '@lib/lens/explore-publications';

const Lists: NextPage = () => {
  const [publications, setPublications] = useState<any[]>([]);
  // const lensProfile = useContext(ProfileContext);
  const { profile: lensProfile } = useContext(ProfileContext);

  const { tags } = useContext(TagsFilterContext);

  useEffect(() => {
    // FIXME send the filter first!
    explore({ tags }).then((data) => {
      const filteredItems = data.items.filter(
        (r) =>
          r.metadata.attributes[0].value === 'post' &&
          r.profile.id === lensProfile?.id
      );
      setPublications(filteredItems);
    });
  }, [tags]);

  explore({ tags });
  return (
    <Layout title="Lenstags | Explore" pageDescription="Explore" screen={true}>
      <div className="md:w-4/5 container mx-auto  w-11/12 py-10  ">
        <div className="mb-3">
          <TagsFilter />
        </div>
        <div className="h-auto w-full">{/* <Pagination /> */}</div>
      </div>
      <div className="text-center text-2xl">My creations</div>
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
