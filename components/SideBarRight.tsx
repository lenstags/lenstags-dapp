import ProfileButton from './ProfileButton';

const SideBarRight = () => {
  return (
    <div className="right-0 col-span-3 hidden pr-4 sm:inline">
      <div className="sticky top-0 py-4">
        <ProfileButton className="mb-3" />

        {/* top creators */}
        <div className="mt-2 rounded-t-lg bg-stone-200 py-4 pr-4">
          <div className=" rounded-lg pl-4">
            <div className=" flex items-baseline justify-between">
              <p className=" font-serif text-sm font-bold">Top Creators</p>
              <p className=" font-sans text-xs font-bold">View ranking</p>
            </div>
          </div>
        </div>
        <div className="mb-6 w-full bg-stone-100">...</div>

        <div className="rounded-t-lg bg-stone-200 py-4 pr-4">
          <div className=" rounded-lg pl-4">
            <div className=" flex items-baseline justify-between">
              <p className=" font-serif text-sm font-bold">Recommended lists</p>
              <p className=" font-sans text-xs font-bold">View all</p>
            </div>
          </div>
        </div>
        <div className="mb-6 w-full bg-stone-100">...</div>
      </div>
    </div>
  );
};
export default SideBarRight;
