import { PublicationSearchType } from '@components/SearchBar';
import ImageProxied from '@components/ImageProxied';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import PostIndicators from '@components/PostIndicators';
import Link from 'next/link';

export const ResultsCard = ({
  publication
}: {
  publication: PublicationSearchType;
}) => {
  return (
    <div
      key={publication.id}
      className="flex flex-col min-w-full border-4 border-stone-100 min-h-[200px] rounded-xl pt-3 pb-8 px-4"
    >
      <div className="flex min-w-full justify-between items-center">
        <div className="flex items-center space-x-2 mb-4">
          <ImageProxied
            category="profile"
            alt="Profile picture"
            width={20}
            height={20}
            src={publication.profilePicture}
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold">{publication.profileName}</span>
          <span className="text-gray-400">@{publication.profileHandle}</span>
          <span className="text-sm text-gray-500">
            • {moment(publication.createdAt).fromNow()}
          </span>
        </div>
        <EllipsisHorizontalIcon className="w-6 h-6 mb-4" />
      </div>
      <div className="flex">
        <ImageProxied
          category="post"
          src={publication.image}
          width={400}
          height={200}
          alt="Publication picture"
          className="max-w-[40%] min-w-[40%] max-h-[200px] rounded-xl mr-4 aspect-video object-cover"
        />
        <div className="flex flex-col justify-between">
          <Link
            href={`${publication.type}/${publication.id}`}
            className="flex flex-col"
          >
            <h3 className="font-bold text-xl mb-2">{publication.name}</h3>
            <p className="text-sm mb-2">{publication.content}</p>
          </Link>
          <div className="flex justify-between my-2">
            <div className="flex space-x-1">
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-[1px] border-black rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
            <PostIndicators
              collects={publication.totalAmountOfCollects.toString()}
              comments={publication.totalAmountOfComments.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
