import {
  ATTRIBUTES_LIST_KEY,
  PRIVATE_LIST_NAME,
  PROFILE_METADATA_VERSION
} from '@lib/config';
import { AttributeData, ProfileMetadata } from './interfaces/profile-metadata';
import { findKeyAttributeInProfile, pickPicture } from 'utils/helpers';
import {
  getComments,
  getLastComment,
  getLastCommentList
} from './get-publications';

import { IbuiltPost } from './interfaces/publication';
import { MetadataDisplayType } from './interfaces/generic';
import { createPostGasless } from './post-gasless';
import { getPublication } from './get-publication';
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
    name: PRIVATE_LIST_NAME, // HACK should it be 'My stuff {private)?
    content: PRIVATE_LIST_NAME + ' ...',
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
    // content: `Hi there! This is a favList , you can see it in my profile here → <a target="_blank" rel="noopener"
    // href="https://www.nata.social/profile/${lensProfile.id}">https://www.nata.social/profile/${lensProfile.id}</a>`,
    content: `I have created a list called '${name}' in Nata Social. You'll be able to check it out soon!
\n\n
    Your bookmarks, now social.`,

    locale: 'en',
    attributes: [
      {
        key: 'internalPublicationType', // FIXME test!
        displayType: MetadataDisplayType.string,
        value: 'list' // the type list either [ list, post ]
      }
    ]
  };

  const result = await createPostGasless(lensProfile?.id, constructedUserPost);

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

export const getUserLists = async (profileId: string) => {
  const readProfile = await queryProfile({
    profileId
  });
  // const parsedLists2 = JSON.parse(
  //   readProfile?.attributes?.find(
  //     (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
  //   )?.value || `[]`
  // );

  const listAttributeObject = findKeyAttributeInProfile(
    readProfile,
    ATTRIBUTES_LIST_KEY
  );
  // Gives something like this:
  // {
  //   "displayType": "string",
  //   "value": "[{\"name\":\"My private list\",\"key\":\"0x8904-0x0a\"}]",
  //   "key": "list_warehouse_7"
  // }
  // console.log('xxxxx ', readProfile);
  const parsedLists = listAttributeObject
    ? JSON.parse(listAttributeObject.value)
    : [];
  // const hasLists =
  // listAttributeObject && JSON.parse(listAttributeObject.value).length > 0;

  // id sanitisation
  return parsedLists.filter((i: any) => i.key.includes('-'));
};

export const getPopulatedLists = async (profileId: any) => {
  const arrLists = await getUserLists(profileId);
  if (!arrLists) {
    return;
  }

  return Promise.allSettled(
    arrLists.map((list: any) => {
      return getLastCommentList(list.key)
        .then((lastComment) => {
          if (!lastComment || !lastComment.items.metadata) {
            console.log('lastcomment null detected ', list.name);
            return [];
          }

          // @ts-ignore
          const listContents = lastComment.items.metadata.tags;
          const listName = list.name;
          const listKey = list.key;
          const listCreatedAt = lastComment.items.createdAt;
          const listCollects = lastComment.items.stats.totalAmountOfCollects;

          const postsPromises = listContents.map(async (postId: string) => {
            return {
              listName,
              listKey,
              postId,
              listCreatedAt,
              listCollects,
              postMetadata: (await getPublication(postId))?.metadata
            };
          });

          return Promise.allSettled(postsPromises);
        })
        .then((results: any) => {
          if (!results) {
            return;
          }
          const data = results
            .filter((r: any) => r.status === 'fulfilled')
            .map((r: any) => ({
              id: r.value.postId,
              name: r.value.postMetadata.name,
              tags: r.value.postMetadata.tags,
            }));

          return {
            id: results[0]?.value.listKey,
            name: results[0]?.value.listName,
            createdAt: results[0]?.value.listCreatedAt,
            collects: results[0]?.value.listCollects,
            posts: data
          };
        });
    })
  ).then((results) =>
    results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value)
  );
};
