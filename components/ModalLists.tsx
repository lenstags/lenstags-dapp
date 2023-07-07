import { createUserList, typeList } from '@lib/lens/load-lists';
import { useContext, useEffect, useState } from 'react';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import Image from 'next/image';
import { ProfileContext } from './LensAuthenticationProvider';
import { ProfileQuery } from '@lib/lens/graphql/generated';
import { addPostIdtoListId } from '@lib/lens/post';
import { freeCollect } from '@lib/lens/collect';
import { queryProfile } from '@lib/lens/dispatcher';
import { useSnackbar } from 'material-ui-snackbar-provider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  processStatus: (status: string) => void;
}

const ListsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  postId,
  processStatus
}) => {
  const snackbar = useSnackbar();
  const [valueListName, setValueListName] = useState('');
  const { profile: lensProfile } = useContext(ProfileContext);

  const firstList = JSON.parse(
    lensProfile?.attributes?.find(
      (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
    )?.value || `[]`
  );

  console.log('ffff ', lensProfile?.attributes);

  const [lists, setLists] = useState<typeList[]>(firstList);
  const [createMenu, setCreateMenu] = useState(false);
  const [selectedList, setSelectedList] = useState<typeList[]>(lists);

  const handleChangeListName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValueListName(event.target.value);

  const refreshLists = async (profileId: string) => {
    const readProfile: ProfileQuery['profile'] = await queryProfile({
      profileId
    });
    const parsedLists = JSON.parse(
      readProfile?.attributes?.find(
        (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
      )?.value || `[]`
    );
    setLists(parsedLists);
    setSelectedList(parsedLists); // FIXME: should be only one?
  };

  const handleAddPostToList = async (
    profileId: string,
    selectedPostId: string,
    listId?: string,
    name?: string
  ) => {
    // setIsPosting(true);
    // setDotColor(' border-red-400 bg-red-600 ');
    // setDotTitle('Creating post');

    // modalStatus = 'creating-list';
    // modalStatus='collecting-post'
    // modalStatus='adding-post'
    // modalStatus='indexing'
    onClose();

    // verifies if selected list does exist in the current profile, if not, create it
    if (!listId) {
      // FIXME: DON'T RETURN AN OBJECT?
      // TODO: OPTIMIZE IT
      // setDotColor(' border-red-400 bg-black');
      // setDotTitle('Creating list');
      snackbar.showMessage(
        '🟦 Creating the new list, you can continue exploring.'
      );
      processStatus('creating-list');

      listId = (await createUserList(lensProfile, name!)).key;
      console.log('List created, (post) ID returned to the UI: ', listId);
    }

    // TODO: DEPRECATED ATM
    // const clonedId = await cloneAndCollectPost(lensProfile, selectedPostId);
    // if (!clonedId) {
    //   throw 'Unknown error when cloning';
    // }

    snackbar.showMessage(
      '🟦 Minting the collected item, you can continue exploring.'
    );
    processStatus('collecting-post');

    const collectResult = await freeCollect(selectedPostId);

    if (collectResult.errors?.length > 0) {
      // FIXME
      // setIsPosting(false);
      processStatus('error-unauthenticated');
      if (collectResult.errors[0].extensions.code === 'UNAUTHENTICATED') {
        snackbar.showMessage(
          `🟥 Error UNAUTHENTICATED: ${collectResult.errors[0].message}`
        );
        // setOpenReconnect(true);
        return;
      }
      // setIsPosting(false);
      snackbar.showMessage(`🟨 Attention: ${collectResult.errors[0].message}`);
      return;
    }

    // just add the post to the list
    // setDotColor(' border-yellow-400 bg-yellow-600 ');
    // setDotTitle('Indexing list');
    processStatus('adding-post');
    const addResult = await addPostIdtoListId(
      profileId,
      listId,
      selectedPostId
    );

    snackbar.showMessage(
      '🟩 Item added to list! 🗂️'
      // 'Undo', () => handleUndo()
    ); // TODO: SHOW SOME UI BOX
    // TODO: update lists in UI!
    // setDotColor(' border-blue-400 bg-blue-600 ');
    // setDotTitle('Finished');
    // setIsPosting(false);
    processStatus('finished');
    onClose();
    return;
  };

  // useEffect(() => {
  //   if (isOpen) {
  //     refreshLists(lensProfile?.id);
  //     processAsync(postId, listId)
  //       .then(() => {
  //         onProcessEnd();
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       })
  //       .finally(() => {
  //         onClose();
  //       });
  //   }
  // }, [isOpen, postId, listId, onClose, onProcessEnd]);

  useEffect(() => {
    refreshLists(lensProfile?.id);
  }, [lensProfile?.id]);

  return isOpen ? (
    <div
      className="duration-600 fixed bottom-0 left-0 right-0 top-0 z-50 flex 
     items-center justify-center bg-stone-900
       bg-opacity-60 
       opacity-100 backdrop-blur-sm animate-in fade-in-5"
    >
      {createMenu ? (
        // create new list and add
        <div className="w-1/4 rounded-lg bg-white px-6 py-3">
          {/* title  */}
          <div className="my-4 flex items-center justify-between font-serif text-xl">
            <div className="flex items-center gap-3">
              <button
                className="bg-transparent"
                onClick={() => setCreateMenu(false)}
              >
                <Image width={24} height={24} alt="" src="/icons/back.svg" />
              </button>
              <span>Create a list</span>
            </div>
            <button className="bg-transparent" onClick={onClose}>
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.9999 1.61143L15.3882 0L8.99849 6.38857L2.60878 0L0.99707 1.61143L7.38677 8L0.99707 14.3886L2.60878 16L8.99849 9.61143L15.3882 16L16.9999 14.3886L10.6102 8L16.9999 1.61143Z"
                  fill="#121212"
                />
              </svg>
            </button>
          </div>
          {/* name  */}
          <div className="py-2">
            Name
            <input
              type="text"
              autoComplete="off"
              value={valueListName}
              onChange={handleChangeListName}
              className=" w-full rounded-lg bg-gray-100 px-4 py-3 text-sm 
             text-gray-500 outline-none"
              name="tag-search-input"
              id="tag-search-input"
              // onKeyDown={handleKeyDown}
              placeholder="List name"
            />
          </div>

          {/* tags  */}
          <div className="py-2 text-stone-400">
            Select your tags
            <input
              type="text"
              autoComplete="off"
              // value={valueListName}
              // onChange={handleChangeListName}
              className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 text-sm 
             text-gray-500 outline-none"
              // onKeyDown={handleKeyDown}
              placeholder="Pick at least 1 tag..."
            />
          </div>

          {/* private toggle  */}
          <div className="py-2 text-stone-400">
            <label className="flex items-center space-x-3">
              <span className="text-teal-700 dark:text-gray-400">
                Private list
              </span>{' '}
              <input
                disabled
                checked={false}
                type="checkbox"
                className="form-checkbox h-5 w-5 text-teal-200"
              />
            </label>
          </div>

          {/* create button  */}
          <button
            onClick={() =>
              handleAddPostToList(
                lensProfile?.id,
                postId,
                undefined,
                valueListName
              )
            }
            className="my-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            <div className=" flex items-center  ">+ Create and add</div>
          </button>
        </div>
      ) : (
        // existing list (main)
        <div className="w-1/4 rounded-lg bg-white px-6 py-3">
          {/* title  */}
          <div className="my-4 flex items-center justify-between font-serif text-xl">
            <span>Collect into a list</span>
            <button className="bg-transparent" onClick={onClose}>
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.9999 1.61143L15.3882 0L8.99849 6.38857L2.60878 0L0.99707 1.61143L7.38677 8L0.99707 14.3886L2.60878 16L8.99849 9.61143L15.3882 16L16.9999 14.3886L10.6102 8L16.9999 1.61143Z"
                  fill="#121212"
                />
              </svg>
            </button>
          </div>

          {/* finder  */}
          <input
            type="text"
            autoComplete="off"
            value={valueListName}
            onChange={handleChangeListName}
            className=" w-full rounded-full bg-gray-100 px-4 py-3 text-sm 
           text-gray-500 outline-none"
            name="tag-search-input"
            id="tag-search-input"
            // onKeyDown={handleKeyDown}
            placeholder="🔍  Find a list"
          />

          {/* the list */}
          <div
            className="scrollbar-hisde overflow-y-asuto
               z-10 my-4 rounded-lg
                border border-gray-100"
          >
            {selectedList.map((list: typeList) => {
              return (
                <div
                  className="group flex items-center justify-between 
                        border-l-4 border-l-transparent
                        bg-transparent
                        px-4 py-2
                        text-sm hover:border-l-4
                         hover:border-l-teal-200 hover:bg-stone-100  hover:font-bold"
                  key={list.key}
                >
                  {list.name}
                  <div className="flex items-center">
                    {list.name === 'My private list' && (
                      <div title="This list is private 🔒" className="mr-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.3335 6V4.66667C5.3335 3.19391 6.5274 2 8.00016 2C9.47292 2 10.6668 3.19391 10.6668 4.66667V6M5.46683 14H10.5335C11.2802 14 11.6536 14 11.9388 13.8547C12.1897 13.7268 12.3937 13.5229 12.5215 13.272C12.6668 12.9868 12.6668 12.6134 12.6668 11.8667V8.13333C12.6668 7.3866 12.6668 7.01323 12.5215 6.72801C12.3937 6.47713 12.1897 6.27316 11.9388 6.14532C11.6536 6 11.2802 6 10.5335 6H5.46683C4.72009 6 4.34672 6 4.06151 6.14532C3.81063 6.27316 3.60665 6.47713 3.47882 6.72801C3.3335 7.01323 3.3335 7.3866 3.3335 8.13333V11.8667C3.3335 12.6134 3.3335 12.9868 3.47882 13.272C3.60665 13.5229 3.81063 13.7268 4.06151 13.8547C4.34672 14 4.72009 14 5.46683 14Z"
                            stroke="#999999"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                    <button
                      key={list.key}
                      value={list.key}
                      onClick={() =>
                        handleAddPostToList(lensProfile?.id, postId, list.key)
                      }
                      className=" invisible rounded-lg bg-black px-2  py-2 group-hover:visible  "
                    >
                      <div className=" flex items-center text-xs ">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 1C7.5 0.723858 7.27614 0.5 7 0.5C6.72386 0.5 6.5 0.723858 6.5 1L7.5 1ZM6.5 8.33333C6.5 8.60948 6.72386 8.83333 7 8.83333C7.27614 8.83333 7.5 8.60948 7.5 8.33333H6.5ZM10.0202 7.35355C10.2155 7.15829 10.2155 6.84171 10.0202 6.64645C9.82496 6.45118 9.50838 6.45118 9.31311 6.64645L10.0202 7.35355ZM7.4714 9.19526L7.11785 8.84171L7.4714 9.19526ZM6.5286 9.19526L6.88215 8.84171L6.5286 9.19526ZM4.68689 6.64645C4.49162 6.45118 4.17504 6.45118 3.97978 6.64645C3.78452 6.84171 3.78452 7.15829 3.97978 7.35355L4.68689 6.64645ZM1.5 9.66667C1.5 9.39052 1.27614 9.16667 1 9.16667C0.723858 9.16667 0.5 9.39052 0.5 9.66667H1.5ZM13.5 9.66667C13.5 9.39052 13.2761 9.16667 13 9.16667C12.7239 9.16667 12.5 9.39052 12.5 9.66667H13.5ZM11.908 12.782L11.681 12.3365H11.681L11.908 12.782ZM12.782 11.908L13.2275 12.135L12.782 11.908ZM1.21799 11.908L0.772484 12.135L1.21799 11.908ZM2.09202 12.782L1.86502 13.2275H1.86502L2.09202 12.782ZM6.5 1L6.5 8.33333H7.5L7.5 1L6.5 1ZM9.31311 6.64645L7.11785 8.84171L7.82496 9.54882L10.0202 7.35355L9.31311 6.64645ZM6.88215 8.84171L4.68689 6.64645L3.97978 7.35355L6.17504 9.54882L6.88215 8.84171ZM7.11785 8.84171C7.05276 8.9068 6.94724 8.9068 6.88215 8.84171L6.17504 9.54882C6.63065 10.0044 7.36935 10.0044 7.82496 9.54882L7.11785 8.84171ZM0.5 9.66667V9.8H1.5V9.66667H0.5ZM4.2 13.5H9.8V12.5H4.2V13.5ZM13.5 9.8V9.66667H12.5V9.8H13.5ZM9.8 13.5C10.3518 13.5 10.7957 13.5004 11.1543 13.4711C11.5187 13.4413 11.8388 13.3784 12.135 13.2275L11.681 12.3365C11.5493 12.4036 11.3755 12.4497 11.0729 12.4744C10.7645 12.4996 10.3683 12.5 9.8 12.5V13.5ZM12.5 9.8C12.5 10.3683 12.4996 10.7645 12.4744 11.0729C12.4497 11.3755 12.4036 11.5493 12.3365 11.681L13.2275 12.135C13.3784 11.8388 13.4413 11.5187 13.4711 11.1543C13.5004 10.7957 13.5 10.3518 13.5 9.8H12.5ZM12.135 13.2275C12.6054 12.9878 12.9878 12.6054 13.2275 12.135L12.3365 11.681C12.1927 11.9632 11.9632 12.1927 11.681 12.3365L12.135 13.2275ZM0.5 9.8C0.5 10.3518 0.499611 10.7957 0.528909 11.1543C0.558684 11.5187 0.62159 11.8388 0.772484 12.135L1.66349 11.681C1.5964 11.5493 1.55031 11.3755 1.52559 11.0729C1.50039 10.7645 1.5 10.3683 1.5 9.8H0.5ZM4.2 12.5C3.6317 12.5 3.23554 12.4996 2.92712 12.4744C2.62454 12.4497 2.45069 12.4036 2.31901 12.3365L1.86502 13.2275C2.16117 13.3784 2.48126 13.4413 2.84569 13.4711C3.20428 13.5004 3.6482 13.5 4.2 13.5V12.5ZM0.772484 12.135C1.01217 12.6054 1.39462 12.9878 1.86502 13.2275L2.31901 12.3365C2.03677 12.1927 1.8073 11.9632 1.66349 11.681L0.772484 12.135Z"
                            fill="white"
                          />
                        </svg>
                        <span className="ml-2 mr-1 font-bold text-white ">
                          Collect
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* create button  */}
          <button
            onClick={() => setCreateMenu(true)}
            className="border-1  my-4 rounded-lg border-solid
           border-black bg-white px-4 py-2"
          >
            <div className=" flex items-center">+ Create a list</div>
          </button>
        </div>
      )}
    </div>
  ) : null;
};

export default ListsModal;
