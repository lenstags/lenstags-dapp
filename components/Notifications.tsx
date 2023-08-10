import {
  BookOpenIcon,
  BookmarkSquareIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { NotificationTypes } from '@models/notifications.models';
import { ParsedResponseType } from '@pushprotocol/restapi';
import { useEffect, useRef, useState } from 'react';
import ProfileCard, { ProfileProps } from './ProfileCard';
import { profile as getProfile } from '@lib/lens/get-profile';
import { Profile } from '@lib/lens/graphql/generated';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/HoverCard';
import Link from 'next/link';
import { PublicRoutes } from '@models/routes.model';

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
  notif: ParsedResponseType;
}
const Notifications = ({ notif }: NotificationsProps) => {
  const isJSON = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const [notifMessage, setNotifMessage] = useState<any>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profile, setProfile] = useState<any>();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const profileId = notif.notification.title.split(' - ')[1].includes('0x')
    ? notif.notification.title.split(' - ')[1]
    : null;

  useEffect(() => {
    if (profileId)
      getProfile(profileId).then((res) => {
        setProfile(res);
      });
    if (isJSON(notif.message)) {
      setNotifMessage(JSON.parse(notif.message));
    } else {
      setNotifMessage(notif.message);
    }
  }, [profileId, notif.message]);

  return (
    <div
      className="flex w-full select-none items-center gap-2 px-6 py-2 hover:bg-teal-50"
      key={notif.sid}
    >
      {notifToIconMap[notif.cta]}
      {showProfileCard && (
        <ProfileCard profile={profile} showCard={showProfileCard} />
      )}
      <span className="line-clamp-2 w-full text-ellipsis text-[14px]">
        <HoverCard>
          <HoverCardTrigger className="cursor-pointer font-bold text-black">
            {notif.title}
          </HoverCardTrigger>
          {profile?.id && (
            <HoverCardContent align="start">
              <ProfileCard profile={profile} showCard={showProfileCard} />
            </HoverCardContent>
          )}
        </HoverCard>
        <span className="font-bold text-black"></span> {notif.notification.body}
        {notifMessage?.id && (
          <Link
            className="font-extrabold hover:underline"
            href={`${PublicRoutes.POST}/${notifMessage.id}`}
          >
            {' '}
            &quot;{notifMessage.name}&quot;
          </Link>
        )}
      </span>
    </div>
  );
};
export default Notifications;
