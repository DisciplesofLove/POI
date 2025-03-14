import React from 'react';
import { Container, Grid, Heading, Text, Box } from '@chakra-ui/react';
import { ModelCard } from '../components/ModelCard';
import { useModels } from '../hooks/useModels';
import { Layout } from '../components/Layout';

export default function Home() {
  const { models, loading, error } = useModels();

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading>JoyNet AI Marketplace</Heading>
          <Text mt={2} color="gray.600">
            Discover and execute AI models with verifiable inference
          </Text>
        </Box>

        {loading && <Text>Loading models...</Text>}
        {error && <Text color="red.500">Error: {error}</Text>}

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
        >
          {models?.map((model) => (
            <ModelCard
              key={model.id}
              modelId={model.id}
              name={model.name}
              description={model.description}
              price={model.price}
              owner={model.owner}
              stats={model.stats}
            />
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}