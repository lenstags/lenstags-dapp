import { GenericMetadata, MetadataDisplayType } from './generic';

interface MetadataMedia {
  item: string;
  /**
   * This is the mime type of media
   */
  type: string;
}

export interface MetadataAttribute {
  displayType?: MetadataDisplayType;
  traitType?: string;
  value: string;
}

export interface Metadata extends GenericMetadata {
  description?: string;
  mainContentFocus?: string;
  locale?: string;
  content: string;
  external_url?: string | null;
  createdOn: string;
  name?: string;
  attributes?: MetadataAttribute[];
  image?: string | null;
  imageMimeType?: string | null;
  media?: MetadataMedia[];
  tags?: string[];
  animation_url?: string;
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
