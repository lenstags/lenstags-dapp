import { ATTRIBUTES_LIST_KEY, PROFILE_METADATA_VERSION } from '@lib/config';
import { AttributeData, ProfileMetadata } from './interfaces/profile-metadata';

import { IbuiltPost } from './interfaces/publication';
import { MetadataDisplayType } from './interfaces/generic';
import { ProfileContext } from 'components';
import { createPostGasless } from './post-gasless';
import { createPostPaid } from './post';
import { pickPicture } from '@lib/helpers';
import { queryProfile } from './dispatcher';
import { updateProfileMetadata } from '@lib/lens/update-profile-metadata-gasless';
import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface typeList {
  name: string;
  key: string;
}

export const createDefaultList = async (lensProfile: any) => {
  // the setup of the default list
  const constructedDefaultPost: IbuiltPost = {
    name: 'My private list', // TODO should it be 'My stuff {private)?
    content: 'All my collected items',
    locale: 'ia', // INTERLINGUA https://www.wikidata.org/wiki/Q22282939
    attributes: [
      {
        key: 'internalPublicationType', // FIXME this key isn't returned by get-publications!
        displayType: MetadataDisplayType.string,
        value: 'privateDefaultList' // the type list either [ list, post ]
      }
    ]
  };

  // TODO test with no dispatcher

  let defaultListId: string, result: any;

  if (lensProfile?.dispatcher?.canUseRelay) {
    result = await createPostGasless(
      lensProfile?.id,
      constructedDefaultPost,
      true
    );
    defaultListId = result.internalPubId;
  } else {
    result = await createPostPaid(
      lensProfile?.id,
      constructedDefaultPost,
      true
    );
    defaultListId = result;
  }

  // const result = lensProfile?.dispatcher?.canUseRelay
  //   ? await createPostGasless(lensProfile?.id, constructedDefaultPost, true)
  //   : await createPostPaid(lensProfile?.id, constructedDefaultPost, true);
  console.log('result en load-lists ', result);
  ////////////////////
  // area de update del perfil metadata
  ////////////////////

  // const defaultListId = result.internalPubId;

  console.log('BBBBB ', defaultListId);
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
    key: ATTRIBUTES_LIST_KEY // TODO: USE ATTRIBUTES_LIST_KEY ONCE IN PROD
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

  const result = await createPostGasless(lensProfile?.id, constructedUserPost);

  // got the postId!
  console.log('New list created: ', result.internalPubId);

  ////////////////////
  // area de update del PROFILE metadata
  ////////////////////

  // got the postId, and ADD it to the profile.metadata
  // await freeCollect(result.internalPubId);
  const userListId = result.internalPubId; // collectedPubId; // result.pubId; // TODO or internalPubId???

  // update profile metadata!
  // hacerlo en otra funcion updateProfileMetadata(profileId, attributes)

  // esta funcion envia los attributes y reemplaza los de id que contiene
  // ej mando attributes con lista actualizada, buscar en attributes del perfil la key ATTRIBUTES_LIST_KEY y reemplazar el objeto

  // TODO HACERLO EN OTRA FUNCION LO DE A CONTINUACION
  //   await updateProfileAttributes(lensProfile.id, attribute);

  const profileResult = await queryProfile({ profileId: lensProfile?.id });
  if (!profileResult) {
    throw 'once again no profile result!';
  }

  // #region custom attrib setup DEPRECATED

  // get current attribs
  // FIXME should write only what I sent!

  // deprecated
  // const attLocation: AttributeData = {
  //   displayType: MetadataDisplayType.string,
  //   traitType: 'string',
  //   value:
  //     profileResult?.attributes?.find(
  //       (attribute) => attribute.key === 'location'
  //     )?.value || '',
  //   key: 'location'
  // };

  // const attTwitter: AttributeData = {
  //   displayType: MetadataDisplayType.string,
  //   traitType: 'string',
  //   value:
  //     profileResult?.attributes?.find(
  //       (attribute) => attribute.key === 'twitter'
  //     )?.value || '',
  //   key: 'twitter'
  // };

  // const attWebsite: AttributeData = {
  //   displayType: MetadataDisplayType.string,
  //   traitType: 'string',
  //   value:
  //     profileResult?.attributes?.find(
  //       (attribute) => attribute.key === 'website'
  //     )?.value || '',
  //   key: 'website'
  // };

  // #endregion
  // aca creÉ el primer elemento con array

  // set on the first setup OK

  // const attCurrentLists: AttributeData = {
  //   displayType: MetadataDisplayType.string,
  //   traitType: 'string',
  //   value:
  //     profileResult?.attributes?.find(
  //       (attribute) => attribute.key === 'website'
  //     )?.value || '',
  //   key: 'website'
  // };

  const currentLists = profileResult.attributes!.find(
    (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
  )!.value;

  const parsedLists: typeList[] = JSON.parse(currentLists);
  const newList: typeList = {
    name: constructedUserPost.name || '',
    key: userListId
  };

  parsedLists.push(newList);
  const attLists: AttributeData = {
    displayType: MetadataDisplayType.string,
    traitType: 'string',
    value: JSON.stringify(parsedLists), // TODO CAN IT BE NON-STRINGIFIED?
    key: ATTRIBUTES_LIST_KEY
  };

  // console.log('attLists', attLists);

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
    attributes: [
      (profileResult.attributes as AttributeData[])[0], // location
      (profileResult.attributes as AttributeData[])[1], // twitter
      (profileResult.attributes as AttributeData[])[2], // website
      attLists
    ]
  };

  const resUpdate = await updateProfileMetadata(
    lensProfile?.id,
    profileMetadata
  );
  return newList;
};

export const loadLists = async (lensProfileOld: any) => {
  const lensProfile = await queryProfile({ profileId: lensProfileOld?.id });
  let defaultListId = lensProfile?.attributes?.find(
    (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
  )?.value;

  return defaultListId
    ? JSON.parse(defaultListId)
    : await createDefaultList(lensProfile);
};
