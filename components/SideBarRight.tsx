import ProfileButton from './ProfileButton';
import RecommendedProfiles from './RecommendedProfiles';

const SideBarRight = () => {
  return (
    <div className="right-0 col-span-3 hidden pr-4 sm:inline">
      <div className="sticky top-0 py-4">
        <ProfileButton className="mb-3" />
        <RecommendedProfiles />

        {/* recommended lists */}
        {/* <div className="rounded-t-lg bg-stone-200 py-4 pr-4">
          <div className=" rounded-lg pl-4">
            <div className=" flex items-baseline justify-between">
              <p className=" font-serif text-sm font-bold">Recommended lists</p>
              <p className=" font-sans text-xs font-bold">View all</p>
            </div>
          </div>
        </div>
        <div className="mb-6 w-full bg-stone-100">...</div> */}
      </div>
    </div>
  );
};
export default SideBarRight;
