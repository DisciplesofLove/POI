import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  VStack,
  Heading,
  Text,
  useToast,
  SimpleGrid,
  Box,
  Button
} from '@chakra-ui/react';
import { useWallet } from '../../hooks/useWallet';
import { useModelMarketplace, Model } from '../../hooks/useModelMarketplace';
import ModelCard from '../../components/ModelCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from '../../components/CategoryFilter';
import ModelDetailModal from '../../components/ModelDetailModal';

const categories = ['All', 'Image', 'Text', 'Audio', 'Video', 'Other'];

export default function AIModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toast = useToast();
  const { account } = useWallet();
  const { loading, getModels } = useModelMarketplace();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, selectedCategory, searchQuery]);

  const loadModels = async () => {
    try {
      const fetchedModels = await getModels();
      setModels(fetchedModels);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI models',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filterModels = () => {
    let filtered = [...models];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        model =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query)
      );
    }

    setFilteredModels(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>AI Models Marketplace</Heading>
          <Text color="gray.600">
            Discover and interact with AI models from the community
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <SearchBar onSearch={handleSearch} />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </SimpleGrid>

        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }}
          gap={6}
        >
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              modelId={model.id}
              name={model.name}
              description={model.description}
              price={model.price}
              owner={model.owner}
              image={model.image}
              category={model.category}
              stats={model.stats}
              onViewDetails={() => handleModelSelect(model)}
            />
          ))}
        </Grid>

        {selectedModel && (
          <ModelDetailModal
            model={selectedModel}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedModel(null);
            }}
          />
        )}

        {filteredModels.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.600">
              No models found matching your criteria
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}