import { ATTRIBUTES_LIST_KEY, PROFILE_METADATA_VERSION } from '@lib/config';
import { AttributeData, ProfileMetadata } from './interfaces/profile-metadata';
import { findKeyAttributeInProfile, pickPicture } from 'utils/helpers';

import { IbuiltPost } from './interfaces/publication';
import { MetadataDisplayType } from './interfaces/generic';
import { createPostGasless } from './post-gasless';
import { queryProfile } from './dispatcher';
import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { v4 as uuidv4 } from 'uuid';

export interface typeList {
  name: string;
  key: string;
}

export const loadLists = async (lensProfileOld: any) => {
  const lensProfile = await queryProfile({ profileId: lensProfileOld?.id });

  console.log(
    'lista predeterminada: ',
    lensProfile?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value
  );

  let defaultListId = lensProfile?.attributes?.find(
    (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
  )?.value;

  return defaultListId
    ? JSON.parse(defaultListId)
    : await createDefaultList(lensProfile);
};

// the setup of the default list
export const createDefaultList = async (lensProfile: any) => {
  const constructedDefaultPost: IbuiltPost = {
    name: 'My private list', // HACK should it be 'My stuff {private)?
    content: 'My private list',
    locale: 'ia', // INTERLINGUA https://www.wikidata.org/wiki/Q22282939
    attributes: [
      {
        key: 'internalPublicationType', // FIXME this key isn't returned by get-publications!!!
        displayType: MetadataDisplayType.string,
        value: 'privateDefaultList' // the type list either [ list, post ]
      }
    ]
  };

  let defaultListId: string, result: any;

  result = await createPostGasless(
    lensProfile?.id,
    constructedDefaultPost,
    true
  );
  defaultListId = result.internalPubId;

  // const result = lensProfile?.dispatcher?.canUseRelay
  //   ? await createPostGasless(lensProfile?.id, constructedDefaultPost, true)
  //   : await createPostPaid(lensProfile?.id, constructedDefaultPost, true);
  console.log('result en load-lists ', result);
  ////////////////////
  // area de update del perfil metadata
  ////////////////////

  // const defaultListId = result.internalPubId;

  // got the postId, and ADD it to the profile.metadata
  // update profile metadata!
  // TODO: refactor into updateProfileMetadata(profileId, attributes)

  // esta funcion envia los attributes y reemplaza los de id que contiene
  // ej mando attributes con lista actualizada, buscar en attributes del perfil la key ATTRIBUTES_LIST_KEY y reemplazar el objeto

  // #region custom attrib setup

  const attLocation: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value:
      lensProfile.attributes?.find(
        (attribute: any) => attribute.key === 'location'
      )?.value || '',
    key: 'location'
  };

  const attTwitter: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value:
      lensProfile.attributes?.find(
        (attribute: any) => attribute.key === 'twitter'
      )?.value || '',
    key: 'twitter'
  };

  const attWebsite: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value:
      lensProfile.attributes?.find(
        (attribute: any) => attribute.key === 'website'
      )?.value || '',
    key: 'website'
  };

  // #endregion

  // set on the first setup OK
  const favIDsArray = [
    { name: constructedDefaultPost.name, key: defaultListId }
  ];

  const attLists: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value: JSON.stringify(favIDsArray), // TODO CAN IT BE NON-STRINGIFIED?
    key: ATTRIBUTES_LIST_KEY // BUG: USE ATTRIBUTES_LIST_KEY ONCE IN PROD
  };

  const profileMetadata: ProfileMetadata = {
    version: PROFILE_METADATA_VERSION,
    metadata_id: uuidv4(),
    name: lensProfile.name || ' ',
    bio: lensProfile.bio || '- empty bio -',
    cover_picture: pickPicture(lensProfile.coverPicture, '/img/profilePic.png'),
    profile_picture: pickPicture(lensProfile.picture, '/img/profilePic.png'),
    attributes: [attLocation, attTwitter, attWebsite, attLists]
  };

  const resUpdate = await updateProfileMetadata(
    lensProfile?.id,
    profileMetadata
  );

  // - once the profile metadata has the default list, use its postId to add
  // to its metadata
  //   the selected post to be fav'd
  // update postId metadata (it is a list, not a post)

  return [{ key: defaultListId, name: constructedDefaultPost.name }];
};

export const createUserList = async (lensProfile: any, name: string) => {
  // the setup of the user list

  const constructedUserPost: IbuiltPost = {
    name,
    content: `Hi there! This is a favList , you can see it in my profile here → <a target="_blank" rel="noopener"
    href="https://www.nata.social/profile/${lensProfile.id}">https://www.nata.social/profile/${lensProfile.id}</a>`,
    locale: 'en',
    attributes: [
      {
        key: 'internalPublicationType', // FIXME test!
        displayType: MetadataDisplayType.string,
        value: 'list' // the type list either [ list, post ]
      }
    ]
  };

  // TODO test with no dispatcher
  // const result = lensProfile?.dispatcher?.canUseRelay
  //   ? await createPostGasless(lensProfile?.id, constructedUserPost)
  //   : await createPostPaid(lensProfile?.id, constructedUserPost);

  const result = await createPostGasless(lensProfile?.id, constructedUserPost); // BUG deberia esperar al indexer?

  ////////////////////
  // area de update del PROFILE metadata
  ////////////////////

  // got the postId, and ADD it to the profile.metadata
  const userListId = result.internalPubId;

  // update profile metadata
  const profileResult = await queryProfile({ profileId: lensProfile?.id });
  if (!profileResult) {
    // just in case
    throw 'once again no profile result!';
  }

  const listAttributeObject = findKeyAttributeInProfile(
    profileResult,
    ATTRIBUTES_LIST_KEY
  )!.value;

  // console.log('1- currentLists: ', listAttributeObject);

  const parsedLists: typeList[] = JSON.parse(listAttributeObject);
  // console.log('2- parsedLists: ', parsedLists);

  const newList: typeList = {
    name: constructedUserPost.name || 'Unnamed',
    key: userListId
  };

  parsedLists.push(newList);

  const attLists: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value: JSON.stringify(parsedLists),
    key: ATTRIBUTES_LIST_KEY
  };

  // console.log('ok attLists', attLists);

  // FIXME TODO attrib definition
  const attLocation: AttributeData =
    findKeyAttributeInProfile(profileResult, 'location')?.value || ' ';

  const attTwitter: AttributeData =
    findKeyAttributeInProfile(profileResult, 'twitter')?.value || ' ';

  const attWebsite: AttributeData =
    findKeyAttributeInProfile(profileResult, 'website')?.value || ' ';

  const profileMetadata: ProfileMetadata = {
    version: PROFILE_METADATA_VERSION,
    metadata_id: uuidv4(),
    name: profileResult.name || undefined,
    bio: profileResult.bio || '- empty bio -',
    cover_picture: pickPicture(
      profileResult.coverPicture,
      '/img/profilePic.png'
    ),
    profile_picture: pickPicture(profileResult.picture, '/img/profilePic.png'),
    attributes: [attLocation, attTwitter, attWebsite, attLists]
  };

  const resUpdate = await updateProfileMetadata(
    lensProfile?.id,
    profileMetadata
  );
  return newList;
};
