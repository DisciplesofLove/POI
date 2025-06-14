import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  useToast,
  Image,
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useWallet } from '../../hooks/useWallet';
import { useModelMarketplace } from '../../hooks/useModelMarketplace';

const categories = ['Image', 'Text', 'Audio', 'Video', 'Other'];

interface ModelFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  modelFile?: File;
}

export default function CreateModelPage() {
  const [formData, setFormData] = useState<ModelFormData>({
    name: '',
    description: '',
    price: '',
    category: categories[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const router = useRouter();
  const toast = useToast();
  const { account } = useWallet();
  const { listModel } = useModelMarketplace();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file as any }));
    }
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, modelFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Upload image and model file to IPFS or storage
      await listModel(formData);
      toast({
        title: 'Success',
        description: 'Model listed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/ai-models');
    } catch (error) {
      console.error('Error creating model:', error);
      toast({
        title: 'Error',
        description: 'Failed to create model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Container maxW="container.md" py={8}>
        <Text textAlign="center">Please connect your wallet to create a model</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Create New AI Model</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Model Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter model name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your model"
                rows={4}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Price (JOY)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="price"
                  value={formData.price}
                  onChange={v => handleChange({ target: { name: 'price', value: v }} as any)}
                  placeholder="Enter price in JOY tokens"
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Preview Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewUrl && (
                <Box mt={2}>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    maxH="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Box>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Model File</FormLabel>
              <Input
                type="file"
                accept=".h5,.pkl,.pt,.pb"
                onChange={handleModelFileChange}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Model
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}