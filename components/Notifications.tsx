import {
  BookOpenIcon,
  BookmarkSquareIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { NotificationTypes } from '@models/notifications.models';

interface notifToIconMapType {
  [key: string]: JSX.Element;
}
const notifToIconMap: notifToIconMapType = {
  [NotificationTypes.CollectedPost]: (
    <BookmarkSquareIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.Followed]: (
    <UserPlusIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.CommentedPost]: (
    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-lensBlack" />
  ),
  [NotificationTypes.CollectedList]: (
    <BookOpenIcon className="h-6 w-6 text-lensBlack" />
  )
};

interface NotificationsProps {
  notif: any;
}
const Notifications = ({ notif }: NotificationsProps) => {
  return (
    <div className="my-2 flex w-full items-center gap-2" key={notif.sid}>
      {notifToIconMap[notif.cta]}
      <span className="w-full truncate text-ellipsis text-[14px]">
        <span className="font-bold text-black">{notif.title}</span>{' '}
        {notif.notification.body}
      </span>
    </div>
  );
};
export default Notifications;
