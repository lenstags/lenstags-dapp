import BackButton from './ui/ButtonBack';
import ProfileButton from './ProfileButton';

// Reserved for custom props like short version, enable search
interface SidebarProps {
  //   position: 'left' | 'right ';
}

const Topbar: React.FC<SidebarProps> = () => {
  return (
    <div className="fixed w-11/12 px-4 pt-4">
      <div className="flex items-center justify-between">
        {/* title */}
        <div className="flex items-center ">
          <BackButton />
          <h1 className="font-serif font-medium">Create post</h1>
        </div>

        {/* button  */}
        <ProfileButton />
      </div>
    </div>
  );
};

export default Topbar;
