/* eslint-disable jsx-a11y/alt-text */
import * as React from 'react';

import { DEFAULT_IMAGE_POST, DEFAULT_IMAGE_PROFILE } from '@lib/config';
import Image, { ImageProps } from 'next/image';

import { getIPFSImage } from 'utils/helpers';

type ImageCategory = 'post' | 'profile';

interface imageProxiedProps extends ImageProps {
  category: ImageCategory;
}

const ImageProxied: React.FC<imageProxiedProps> = (props) => {
  let newSrc = props.src
    ? getIPFSImage(props.src as string)
    : props.category === 'post'
    ? DEFAULT_IMAGE_POST
    : DEFAULT_IMAGE_PROFILE;

  const newProps = {
    ...props,
    src: newSrc,
    alt: props.alt === '' ? 'No contents' : props.alt
  };

  return <Image {...newProps} />;
};
export default ImageProxied;
