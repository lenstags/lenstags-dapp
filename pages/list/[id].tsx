import { ArrowDownIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@components/ui/Dropdown';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@components/ui/HoverCard';
import { LayoutReading, ProfileContext } from '@components/index';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/Table';
import { useContext, useEffect, useState } from 'react';

import { DotFilledIcon } from '@radix-ui/react-icons';
import { DotWave } from '@uiball/loaders';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { GetServerSideProps } from 'next';
import ImageProxied from 'components/ImageProxied';
import Link from 'next/link';
import ListImages from '@components/ListImages';
import ModalLists from 'components/ModalLists';
import Pagination from '@components/Pagination';
import PostIndicators from '@components/PostIndicators';
import { PostProcessStatus } from 'utils/helpers';
import ProfileCard from '@components/ProfileCard';
import { PublicRoutes } from '@models/routes.model';
import { SortBy } from '@models/sorts.model';
import { Spinner } from '@components/Spinner';
import TagStrip from '@components/TagStrip';
import { getLastComment } from '@lib/lens/get-publications';
import { getPublication } from '@lib/lens/get-publication';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useSorts } from '@lib/hooks/use-sort';

interface ListDetailsProps {
  previousRoute: string;
}

const ListDetails: React.FC<ListDetailsProps> = ({ previousRoute }) => {
  const router = useRouter();
  const { id } = router.query;
  const { profile: loggedProfile } = useContext(ProfileContext);
  const [post, setPost] = useState<any>();
  const isList =
    post?.metadata.attributes.length > 0 &&
    (post?.metadata.attributes[0].value === 'list' ||
      post?.metadata.attributes[0].value === 'privateDefaultList');
  const [arrPosts, setArrPosts] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [tagsList, setTagsList] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const [collectStatus, setCollectStatus] = useState(PostProcessStatus.IDLE);
  const [isPosting, setIsPosting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sortName, setSortName] = useState('asc');
  const [sortDate, setSortDate] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = arrPosts.slice(indexOfFirstPost, indexOfLastPost);
  const fromList = previousRoute.includes('list');

  const { sortItems } = useSorts();

  const handleSortName = () => {
    setSortName(sortName === 'asc' ? 'desc' : 'asc');
    sortItems({
      items: arrPosts,
      sort: sortName === 'asc' ? SortBy.ALPHABETICAL : SortBy.ALPHABETICALDESC
    });
  };

  const handleSortDate = () => {
    setSortDate(sortDate === 'asc' ? 'desc' : 'asc');
    sortItems({
      items: arrPosts,
      sort: sortDate === 'asc' ? SortBy.NEWEST : SortBy.OLDEST
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      // const storedObject = localStorage.getItem('LENS_POST') || '';
      // const myObject = JSON.parse(storedObject);
      // console.log(myObject);

      // get post object
      setLoading(true);
      if (!id) {
        return;
      }
      const oo = await getPublication(id as string);
      // TODO RECURSIVE LISTS ISSUE
      console.log(oo);
      const arrIds: any = await getLastComment(id as string);
      console.log('XX< ', arrIds.metadata.tags);

      if (!arrIds || arrIds.length === 0) {
        return;
      }
      setPost(oo);

      const arr = await Promise.all(
        arrIds.metadata.tags.map((id: string) => getPublication(id))
      );
      setArrPosts(arr);

      const arrTags = Array.from(
        new Set(arr.map((post) => post.metadata.tags).flat())
      );
      setTagsList(arrTags);
      setLoading(false);
      console.log('oo post: ', oo);
      console.log('posts ', arr);
    };

    fetchData().catch(console.error);
  }, [id]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProcessStatus = (actualStatus: PostProcessStatus) => {
    setCollectStatus(actualStatus);
    if (
      actualStatus === PostProcessStatus.CREATING_LIST ||
      actualStatus === PostProcessStatus.COLLECTING_POST ||
      actualStatus === PostProcessStatus.ADDING_POST ||
      actualStatus === PostProcessStatus.INDEXING
    ) {
      setIsPosting(true);
    }

    if (actualStatus === PostProcessStatus.FINISHED) {
      setIsPosting(false);
      setIsFinished(true);
    }
  };

  const handleOpenModal = (postId: string) => {
    setPostId(postId);
    setIsModalOpen(true);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    post && (
      <LayoutReading
        title="Nata Social | View list"
        pageDescription="View list"
        breadcumpTitle="List"
        metadataName={post.metadata.name}
        fromList={previousRoute.includes(post.id) ? false : fromList}
      >
        <div
          className="mx-auto h-full w-9/12 text-black"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent, white), url('/img/backPost.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* header */}
          <header className=" items-center">
            <div className="flex w-full justify-between">
              <div className="flex h-40 w-full items-center gap-6">
                <ListImages postId={post.id} className="w-96" h="h-40" />
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-serif text-4xl font-extrabold">
                      {post.metadata.name || 'Untitled post'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="items-center rounded font-semibold text-gray-700 outline-none">
                        <EllipsisHorizontalIcon className="h-8 w-8" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="flex w-40 flex-col gap-1 border-lensBlack px-2"
                        align="start"
                      >
                        <DropdownMenuLabel className="select-none px-0 font-serif font-bold">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer select-none px-0 font-serif outline-none">
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer select-none px-0 font-serif outline-none">
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModalLists
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      postId={postId}
                      post={post}
                      processStatus={handleProcessStatus}
                      ownedBy={post.profile.ownedBy}
                      isList={true}
                    />
                    <HoverCard>
                      <HoverCardTrigger className="flex cursor-pointer items-center gap-2">
                        <ImageProxied
                          category="profile"
                          className="h-7 w-7 rounded-full object-cover"
                          src={post.profile.picture.original.url}
                          alt="avatar"
                          width={40}
                          height={40}
                        />
                        <span className="font-bold">{post.profile.name}</span>
                        <span>@{post.profile.handle}</span>
                      </HoverCardTrigger>
                      {post.profile?.id && (
                        <HoverCardContent align="start">
                          <ProfileCard
                            profile={post.profile}
                            showCard={showProfileCard}
                          />
                        </HoverCardContent>
                      )}
                    </HoverCard>
                    <DotFilledIcon />
                    <span>{moment(post.createdAt).format('DD MMM YYYY')}</span>
                    <div className="ml-auto flex gap-2">
                      <PostIndicators
                        collects={post.stats.totalAmountOfCollects}
                        comments={(
                          parseInt(post.stats.totalAmountOfComments) - 1
                        ).toString()}
                        className="bg-stone-100"
                      />
                      {(isFinished || post.hasCollectedByMe) && (
                        // && post.metadata.attributes[0].value === 'post'
                        <div
                          title="You do own this item!"
                          className="flex cursor-default items-end rounded-md bg-teal-300 px-2 py-1 text-right text-xs font-bold "
                        >
                          Collected
                        </div>
                      )}

                      {loggedProfile &&
                        !isFinished &&
                        !isPosting &&
                        !post.hasCollectedByMe && (
                          <button
                            onClick={() => {
                              handleOpenModal(post.id);
                            }}
                            className="  rounded-lg bg-black "
                          >
                            <div
                              className="flex items-center px-2 py-1
                       text-xs "
                            >
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
                        )}

                      {isPosting && (
                        <div className="flex text-right">
                          <div className=" flex items-center rounded-md bg-teal-100 px-2 py-1 text-xs ">
                            <DotWave size={22} color="#000000" />
                            <span className="ml-2">Collecting</span>
                            <div className="relative ml-1 flex items-center">
                              <div
                                className={`absolute inset-0 m-auto h-1 w-1 animate-ping
                                rounded-full border `}
                              />
                              <Spinner h="3" w="3" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs italic">
                    {post.metadata.description ||
                      'This list has no description'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* body */}
          <div className="flex">
            <div className="mt-4 w-full rounded-lg border pt-2 transition-colors">
              <p className="font-semibold">
                {arrPosts && arrPosts.length > 0 && !loading
                  ? ``
                  : loading
                  ? ''
                  : 'The list has no items yet, have you explored our awesome content?'}
              </p>
              <div className="h-[600px]">
                <div className="flex items-center gap-2 px-4">
                  <ListBulletIcon className="h-5 w-5" />
                  <p className="font-serif text-xl">
                    {arrPosts?.length > 0 ? arrPosts.length : 0} items
                  </p>
                </div>

                {!loading ? (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="flex w-96 items-center px-4">
                          Name
                          {sortName === 'asc' ? (
                            <ArrowDownIcon
                              className="ml-2 h-3 w-3 hover:text-black"
                              onClick={handleSortName}
                            />
                          ) : (
                            <ArrowDownIcon
                              className="ml-2 h-3 w-3 rotate-180 transform hover:text-black"
                              onClick={handleSortName}
                            />
                          )}
                        </TableHead>
                        <TableHead className="w-20 text-center">
                          Items
                        </TableHead>
                        <TableHead className="flex w-28 items-center px-2">
                          Date
                          {sortDate === 'asc' ? (
                            <ArrowDownIcon
                              className="ml-2 h-3 w-3 hover:text-black"
                              onClick={handleSortDate}
                            />
                          ) : (
                            <ArrowDownIcon
                              className="ml-2 h-3 w-3 rotate-180 transform hover:text-black"
                              onClick={handleSortDate}
                            />
                          )}
                        </TableHead>
                        <TableHead className="w-64 px-4 text-left">
                          Tags
                        </TableHead>
                        <TableHead className="w-40 px-4 text-left">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPosts.map((p: any) => {
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="mx-0 flex h-16 max-w-[400px] gap-3 overflow-hidden px-4 font-medium">
                              {p.metadata.attributes[0].value === 'list' ? (
                                <ListImages
                                  postId={p.id}
                                  square
                                  className="w-[50px]"
                                  h="h-[50px]"
                                />
                              ) : (
                                <ImageProxied
                                  category="post"
                                  height={40}
                                  width={50}
                                  alt=""
                                  className="block aspect-square rounded-lg object-cover"
                                  src={p.metadata.media[0]?.original.url}
                                />
                              )}
                              <div className="flex flex-col">
                                <Link
                                  href={`${
                                    p.metadata.attributes[0].value === 'list'
                                      ? PublicRoutes.LIST
                                      : PublicRoutes.POST
                                  }/${p.id}`}
                                  rel="noreferrer"
                                >
                                  <p className="line-clamp-1 font-serif text-xl font-bold">
                                    {p.metadata.name}
                                  </p>
                                </Link>
                                <HoverCard>
                                  <HoverCardTrigger className="flex cursor-pointer flex-col">
                                    <span className="font-serif text-xs">
                                      {p.profile.name}
                                    </span>
                                  </HoverCardTrigger>
                                  {p.profile?.id && (
                                    <HoverCardContent align="start">
                                      <ProfileCard
                                        profile={p.profile}
                                        showCard={showProfileCard}
                                      />
                                    </HoverCardContent>
                                  )}
                                </HoverCard>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {p.stats?.totalAmountOfCollects || '0'}
                            </TableCell>
                            <TableCell className="px-2">
                              {moment(p.createdAt).format('MMM D, YYYY')}
                            </TableCell>
                            <TableCell className="text-right">
                              <TagStrip tags={p.metadata.tags} postId={p.id} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex w-full items-center justify-between gap-4 px-4">
                                <PostIndicators
                                  collects={p.stats.totalAmountOfCollects}
                                  comments={
                                    isList &&
                                    parseInt(post.stats.totalAmountOfComments) >
                                      0
                                      ? (
                                          post.stats.totalAmountOfComments - 1
                                        ).toString() || 0
                                      : post.stats.totalAmountOfComments || 0
                                  }
                                />
                                {(isFinished || p.hasCollectedByMe) && (
                                  // && p.metadata.attributes[0].value === 'post'
                                  <div
                                    title="You do own this item!"
                                    className="flex cursor-default items-end rounded-md bg-teal-300 px-2 py-1 text-right text-xs font-bold "
                                  >
                                    Collected
                                  </div>
                                )}

                                {loggedProfile &&
                                  !isFinished &&
                                  !isPosting &&
                                  !p.hasCollectedByMe && (
                                    <button
                                      onClick={() => {
                                        handleOpenModal(p.id);
                                      }}
                                      className="  rounded-lg bg-black "
                                    >
                                      <div className="flex items-center px-2 py-2 text-xs">
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
                                  )}

                                {isPosting && (
                                  <div className="flex text-right">
                                    <div className=" flex items-center rounded-md bg-teal-100 px-2 py-1 text-xs ">
                                      <DotWave size={22} color="#000000" />
                                      <span className="ml-2">Collecting</span>
                                      <div className="relative ml-1 flex items-center">
                                        <div
                                          className={`absolute inset-0 m-auto h-1 w-1 animate-ping rounded-full border `}
                                        />
                                        <Spinner h="3" w="3" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="items-center rounded font-semibold text-gray-700 outline-none">
                                    <EllipsisHorizontalIcon className="h-8 w-8" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="flex w-40 flex-col gap-1 border-lensBlack px-2"
                                    align="start"
                                  >
                                    <DropdownMenuLabel className="select-none px-0 font-serif font-bold">
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      className="cursor-pointer select-none px-0 font-serif outline-none"
                                      onClick={() => {
                                        router.push(
                                          `${PublicRoutes.POST}/${p.id}`
                                        );
                                      }}
                                    >
                                      Go to post
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Spinner h="10" w="10" />
                  </div>
                )}
              </div>
              {/* Pagination */}

              <Pagination
                postsPerPage={postsPerPage}
                totalPosts={arrPosts.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
      </LayoutReading>
    )
  );
};

export default ListDetails;

export const getServerSideProps: GetServerSideProps = async (context) => {
  let previousRoute = context.req.headers?.referer || undefined;

  if (previousRoute !== undefined) {
    return {
      props: {
        previousRoute
      }
    };
  } else {
    return {
      props: {
        previousRoute: ''
      }
    };
  }
};
