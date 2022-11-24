import { ReactNode } from 'react';
import {
  Box,
  useColorModeValue,
} from '@chakra-ui/react';


interface MainLayoutProps {
  children?: ReactNode;
  header?: ReactNode;
}

const MainLayout = ({ children, header }: MainLayoutProps) =>  (
  <>
  {
    header ? (
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        { header }
      </Box>
    ) : undefined
  }
    <Box p={4}>
      { children }
    </Box>
  </>
);


export default MainLayout;