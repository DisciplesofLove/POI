import React, { ReactNode } from 'react';
import { Box, Container, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box as="main" flex={1} pt="80px">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;