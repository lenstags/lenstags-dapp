import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { DEFAULT_IMAGE_POST, DEFAULT_IMAGE_PROFILE } from '@lib/config';
import Image, { ImageProps } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import { useEffect, useState } from 'react';

import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';

// import { Comment } from '@lib/lens/graphql/generated';
// import { getIPFSImage } from '@lib/helpers';

SwiperCore.use([Autoplay]);

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
    <>
      {URLImages.length > 0 ? (
        <div
        // className=" flex flex-row overflow-hidden pt-6"
        >
          <Swiper
            autoplay={{ delay: 0, disableOnInteraction: false }}
            speed={1000}
            slidesPerView={1}
            spaceBetween={5}
            breakpoints={{
              200: {
                slidesPerView: 1,
                spaceBetween: 5
              }
              // 768: {
              //   slidesPerView: 2,
              //   spaceBetween: 40
              // },
              // 1024: {
              //   slidesPerView: 3,
              //   spaceBetween: 50
              // }
            }}
            loop={true}
          >
            {URLImages.map((urlImage: string, index: number) => {
              return (
                <SwiperSlide key={index}>
                  <div key={index} className="rounded-lg">
                    <Image
                      className="rounded-lg"
                      src={urlImage}
                      alt=""
                      objectFit="cover"
                      width={400}
                      height={200}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ) : (
        <Image
          className="rounded-lg"
          src={DEFAULT_IMAGE_POST}
          alt=""
          objectFit="cover"
          width={400}
          height={200}
        />
      )}
    </>
  );
};
export default ListImages;
