import { PublicRoutes } from 'models';
import { getPublication } from '@lib/lens/get-publication';
import { getLastComment } from '@lib/lens/get-publications';
import {
  LockClosedIcon,
  LockOpenIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { actions } from './SidePanelMyInventory';
import { Spinner } from './Spinner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/Accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/Dropdown';
import { useToast } from './ui/useToast';
import { hidePublication } from '@lib/lens/hide-publication';
import { useSnackbar } from 'material-ui-snackbar-provider';

interface PostByListProps {
  publications: any;
  className?: string;
}

const PostsByList = ({ publications, className }: PostByListProps) => {
  const [fetchList, setFetchList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState<any>('' as any);
  const [posts, setPosts] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const handleAction = (value: string, item: any) => {
    switch (value) {
      case 'go':
        router.push(`${PublicRoutes.LIST}/${item.id}`);
        break;
      case 'copy':
        const links = `${window.location.origin}${PublicRoutes.LIST}/${item.id}`;
        navigator.clipboard.writeText(links);
        toast({
          title: '✅ Link copied to clipboard',
          variant: 'default'
        });
        break;
      case 'delete':
        handleRemove(item.id);
        break;
      default:
        break;
    }
  };

  const handleRemove = (postId: string) =>
    hidePublication(postId).then((res) => {
      if (res) {
        toast({
          title: '🗑️ Post removed successfully',
          variant: 'destructive'
        });
      }
    });

  const handlePostByList = useCallback(
    async (listId: any) => {
      if (postId === listId) {
        return;
      }
      setLoading(true);
      setPostId(listId);
      const postsId: any = await getLastComment(listId);
      if (!postsId) {
        setPosts([]);
        setFetchList(true);
        setLoading(false);
        return;
      }
      const posts = await Promise.all(
        postsId.metadata.tags.map((id: string) => getPublication(id))
      );
      setPosts(posts);
      setLoading(false);
      setFetchList(true);
    },
    [postId]
  );
  return (
    <Accordion
      type="single"
      className={`flex h-full flex-col gap-1 overflow-x-scroll ${className}`}
      collapsible
    >
      {publications?.map((list: any) => (
        <AccordionItem
          value={list.id}
          className="flex flex-col border-0 [&[data-state=open]>div]:border-l-teal-400"
          key={list.id}
        >
          <div className="group flex h-11 w-full cursor-pointer items-center justify-between gap-2 border-l-4 border-transparent px-4 hover:border-l-teal-400 hover:bg-teal-50 data-[state=open]:bg-lensPurple">
            <AccordionTrigger
              arrowLeft
              onClick={() => handlePostByList(list.id)}
              className="text-md ml-2 group-hover:font-bold"
            >
              {list.metadata.name}
            </AccordionTrigger>
            <div className="flex items-center justify-between gap-2">
              {list.metadata.attributes[0].value === 'list' ? (
                <LockOpenIcon className="h-4 w-4 text-lensBlack opacity-0  group-hover:opacity-100" />
              ) : (
                <LockClosedIcon className="h-4 w-4 text-lensBlack opacity-0  group-hover:opacity-100" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none data-[state=open]:bg-teal-400">
                  <EllipsisHorizontalIcon className="h-4 w-4 text-lensBlack opacity-0 group-open:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="flex w-40 flex-col gap-2 border-lensBlack p-4"
                  align="start"
                >
                  {actions.map((item: any) => (
                    <DropdownMenuItem
                      className="cursor-pointer select-none outline-none"
                      key={item.value}
                      onClick={() => handleAction(item.value, list)}
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!loading && fetchList && posts.length > 0 ? (
            posts.map((post: any) => {
              return (
                <AccordionContent key={post} className="ml-4 flex px-4">
                  <span className="mx-4 my-2">{post.metadata.name}</span>
                </AccordionContent>
              );
            })
          ) : !loading && fetchList && posts.length === 0 ? (
            <AccordionContent className="ml-4 flex px-4">
              <span className="mx-4 my-2 text-sm text-lensBlack opacity-50">
                No posts yet
              </span>
            </AccordionContent>
          ) : (
            <AccordionContent>
              <div className="flex items-center justify-center px-4 py-2">
                <Spinner h="4" w="4" />
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default PostsByList;
