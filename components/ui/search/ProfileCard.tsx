import { UserSearchType } from '@components/SearchBar';
import ImageProxied from '@components/ImageProxied';
import Link from 'next/link';

export const ProfileCard = ({ user }: { user: UserSearchType }) => {
  return (
    <Link href={`profile/${user.id}`} key={user.id} className="flex">
      {!user.profilePicture ? (
        <div className="min-w-[3.5rem] min-h-[3.5rem] max-w-[3.5rem] max-h-[3.5rem] bg-lensGray2 rounded-full mr-3"></div>
      ) : (
        <ImageProxied
          category="profile"
          src={user.profilePicture}
          alt="Profile picture"
          width={80}
          height={80}
          className="w-14 h-14 rounded-full mr-3 object-cover"
        />
      )}
      <div className="flex flex-col justify-center">
        <h4 className="font-semibold capitalize">
          {user.name || user.handle.slice(0, -5)}
        </h4>
        <span className="text-gray-500">@{user.handle}</span>
      </div>
    </Link>
  );
};
