import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import moment from 'moment';
import ImageProxied from 'components/ImageProxied';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>();
  useEffect(() => {
    const storedObject = localStorage.getItem('LENS_PROFILE') || '';
    const myObject = JSON.parse(storedObject);
    setProfile(myObject);
  }, [id]);

  return (
    profile && (
      <div className="m-4">
        <article className=" rounded-lg border-2 border-solid border-black bg-white p-4">
          <header className="w-full items-center p-2 md:p-4">
            <div className="row flex w-full justify-between text-sm font-light text-black">
              <div className="col-span-3 mr-2 flex justify-between">
                {
                  <ImageProxied
                    category="profile"
                    title={`Loading...`}
                    alt="Profile"
                    height={50}
                    width={50}
                    objectFit="cover"
                    className="h-12 w-12 cursor-pointer rounded-full"
                    src={profile.picture?.original?.url}
                  />
                }
                <div className="col-span-1 cursor-pointer pl-2">
                  <p className=" ">{profile.name || profile.id}</p>
                  <p className="text-gray-400">@{profile.handle}</p>
                </div>
              </div>
            </div>
          </header>
          <section>
            <div className=" cursor-pointer ">
              <p>name: {profile.name}</p>
              <p>bio: {profile.bio}</p>
              <p>isFollowedByMe: {profile.isFollowedByMe}</p>
              <p>isFollowing: {profile.isFollowing}</p>
              <p>followNftAddress: {profile.followNftAddress}</p>
              <p>picture: {profile.picture?.original?.url}</p>
              <p>cover: {/* {profile.coverPicture} */}</p>
              <p>ownedBy: {profile.ownedBy}</p>
              <p>totalFollowers:{profile.stats?.totalFollowers}</p>
              <p>totalFollowing: {profile.stats?.totalFollowing}</p>
              <p>totalMirrors: {profile.stats?.totalMirrors}</p>
              <p>totalPublications: {profile.stats?.totalPublications}</p>
              <p>totalCollects: {profile.stats?.totalCollects}</p>
            </div>
          </section>
          <footer className="flex items-center  justify-between px-4 py-2 text-right text-black">
            {/* <button
              className="mr-2 rounded-lg border-2  border-solid border-lensBlack   bg-lensPurple px-2.5 py-0.5 
          text-xs font-light text-lensGray hover:bg-lensGray2"
            >
              Collect
            </button> */}
          </footer>
        </article>
      </div>
    )
  );
}
