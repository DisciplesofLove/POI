import React from 'react';
import { Container } from '@chakra-ui/react';
import UserProfile from '../components/UserProfile';

export default function ProfilePage() {
  return (
    <Container maxW="container.xl" py={8}>
      <UserProfile />
    </Container>
  );
}