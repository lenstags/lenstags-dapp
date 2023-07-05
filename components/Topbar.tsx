import ProfileButton from './ProfileButton';

// Reserved for custom props like short version, enable search
interface SidebarProps {
  //   position: 'left' | 'right ';
}

// const Topbar: React.FC<SidebarProps> = ({ position }) => {
const Topbar: React.FC<SidebarProps> = () => {
  return (
    <div className="absolute top-0 w-full">
      <div className="pr-6 pt-4">
        <ProfileButton />
      </div>
    </div>
  );
};

export default Topbar;
