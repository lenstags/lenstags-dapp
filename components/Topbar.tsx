import BackButton from './ui/ButtonBack';
import ProfileButton from './ProfileButton';
import Breadcrumps from 'pages/list/_components/Breadcrumps';

// Reserved for custom props like short version, enable search
interface SidebarProps {
  //   position: 'left' | 'right ';
  breadcumpTitle: string;
  metadataName?: string;
  fromList?: boolean;
}

const Topbar: React.FC<SidebarProps> = ({
  breadcumpTitle,
  metadataName,
  fromList
}) => {
  return (
    <div className="fixed w-11/12 px-4 pt-4">
      <div className="flex items-center justify-between">
        {/* title */}
        <div className="flex items-center ">
          <BackButton />
          {/* <h1 className="font-serif font-medium">{breadcumpTitle}</h1> */}
          <Breadcrumps
            listName={metadataName}
            breadcumpTitle={breadcumpTitle}
            fromList={fromList}
          />
        </div>

        {/* button  */}
        <ProfileButton />
      </div>
    </div>
  );
};

export default Topbar;
