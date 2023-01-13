import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { getIPFSImage } from '@lib/helpers';
import { DEFAULT_IMAGE_PROFILE, DEFAULT_IMAGE_POST } from '@lib/config';

type ImageCategory = 'post' | 'profile';

interface imageProxiedProps extends ImageProps {
  category: ImageCategory;
}

const ImageProxied: React.FC<imageProxiedProps> = (props) => {
  const newProps = {
    ...props,
    src: props.src
      ? getIPFSImage(props.src as string)
      : props.category === 'post'
      ? DEFAULT_IMAGE_POST
      : DEFAULT_IMAGE_PROFILE
  };

  return (
    <>
      <Image alt={!props.alt ? 'Default text' : props.alt} {...newProps} />
    </>
  );
};
export default ImageProxied;
