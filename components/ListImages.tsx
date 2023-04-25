import { DEFAULT_IMAGE_POST, DEFAULT_IMAGE_PROFILE } from '@lib/config';
import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

// import { Comment } from '@lib/lens/graphql/generated';
// import { getIPFSImage } from '@lib/helpers';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';

interface listImageProps {
  postId: string;
}

const ListImages: React.FC<listImageProps> = (props) => {
  // const [comments, setComments] = useState<any>([]);
  const [URLImages, setURLImages] = useState<any>([]);

  useEffect(() => {
    async function fetchComments() {
      const arrPosts = await getLastComment(props.postId);
      // for each comment array, bring each post image
      if (!arrPosts) {
        return;
      }

      const arrImages = await Promise.all(
        // @ts-ignore
        arrPosts.metadata.tags.map(async (postId: string) => {
          const p = await getPublication(postId);
          //   console.log(p.metadata.media[0]?.original?.url);
          if (p?.metadata.media[0]?.original?.url) {
            return p.metadata.media[0]?.original?.url;
          }
        })
      );
      if (arrImages.length >= 3) {
        setURLImages([arrImages[0], arrImages[1], arrImages[2]]);
      } else {
        setURLImages(arrImages);
      }
    }

    fetchComments();
  }, [props.postId]);

  return (
    <div className="flex w-full">
      {URLImages.length > 0 ? (
        URLImages.map((urlImage: string, index: number) => {
          const marginLeft = index === 0 ? 0 : '-100px';

          return (
            <div
              key={`${props.postId}${urlImage}`}
              className=" "
              style={{
                marginLeft
              }}
            >
              <Image
                height={'140px'}
                width={'140px'}
                className="m-2 rounded-md bg-stone-100"
                alt={'Default text'}
                src={urlImage}
                objectFit="cover"
              />
            </div>
          );
        })
      ) : (
        <div className="rounded-md">
          <Image
            height={'400px'}
            width={'600px'}
            key={DEFAULT_IMAGE_POST}
            alt={'Default text'}
            src={DEFAULT_IMAGE_POST}
          />
        </div>
      )}
    </div>
  );
};
export default ListImages;
