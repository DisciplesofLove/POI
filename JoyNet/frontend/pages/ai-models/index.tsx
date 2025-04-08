import { Container, Grid, VStack, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AIModelCard from '../../components/ai/AIModelCard';
import CategoryFilter from '../../components/CategoryFilter';
import SearchBar from '../../components/SearchBar';

export default function AIModelsPage() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // TODO: Fetch models from API
    // This will be implemented in the next iteration
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>AI Models</Heading>
        <SearchBar onSearch={(query) => {
          // TODO: Implement search
        }} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {filteredModels.map((model) => (
            <AIModelCard key={model.id} model={model} />
          ))}
        </Grid>
      </VStack>
    </Container>
  );
}