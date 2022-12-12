import { explore } from "@lib/lens/explore-publications";
import { Layout } from "components";
import ExploreCard from "components/explore/ExploreCard";
import { NextPage } from "next";
import { useEffect, useState } from "react";

const Explore: NextPage = () => {
  const [publications, setpublications] = useState<any[]>([]);
  useEffect(() => {
    explore().then((data) => setpublications(data.items));
  }, []);

  explore();
  return (
    <Layout
      title="Lenstags | Explore"
      pageDescription="TODO: Descripcion de la pagina"
      screen={true}
    >
      <div className="container mx-auto px-4 md:px-12">
    <div className="flex flex-wrap -mx-1 lg:-mx-4">

      {publications &&
        publications.map((post, index) => {
         console.log(post);
         
          return <ExploreCard post={post} key={index}/>
        })}
      </div>
    </div>
   
    </Layout>
  );
};

export default Explore;
