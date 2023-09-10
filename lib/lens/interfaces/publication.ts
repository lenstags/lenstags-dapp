import { GenericMetadata, MetadataDisplayType } from './generic';

import { MediaOutput } from '../graphql/generated';

export interface MetadataAttribute {
  displayType?: MetadataDisplayType;
  traitType?: string;
  value: string;
  key: string;
}

export interface IbuiltPost {
  title?: string;
  name?: string;
  abstract?: string;
  content: string;
  link?: string;
  cover?: string;
  tags?: string[];
  locale: string; // en or undisclosed
  external_url?: string;
  originalPostId?: string;
  // attributes: AttributeData[];
  attributes: MetadataAttribute[];
  image?: Buffer | null; // single image
  imageMimeType?: string | null;
  contentWarning?: PublicationContentWarning;
}

// contract

export enum PublicationContentWarning {
  NSFW = 'NSFW',
  SENSITIVE = 'SENSITIVE',
  SPOILER = 'SPOILER'
}

export interface Metadata extends GenericMetadata {
  description?: string;
  content?: string;
  external_url?: string | null;
  link?: string | null;
  name: string;
  attributes: MetadataAttribute[];
  image?: Buffer | null; //single image
  imageMimeType?: string | null;
  media?: MediaOutput[];
  animation_url?: string;
  locale: string;
  tags?: string[];
  contentWarning?: PublicationContentWarning;
  mainContentFocus: PublicationMainFocus;
}

export enum PublicationMainFocus {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  ARTICLE = 'ARTICLE',
  TEXT_ONLY = 'TEXT_ONLY',
  AUDIO = 'AUDIO',
  LINK = 'LINK',
  EMBED = 'EMBED'
}
