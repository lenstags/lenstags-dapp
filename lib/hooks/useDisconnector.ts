import { PublicRoutes } from '@models/routes.model';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import router from 'next/router';
import { useDisconnect } from 'wagmi';
import { useExplore } from '@context/ExploreContext';

const useDisconnector = () => {
  const { disconnect } = useDisconnect();
  const { setIsExplore, setSkipExplore } = useExplore();

  const handleDisconnect = () => {
    deleteLensLocalStorage();
    setIsExplore(true);
    setSkipExplore(false);
    disconnect();
    router.push(PublicRoutes.APP);
  };

  return { handleDisconnect };
};

export default useDisconnector;
