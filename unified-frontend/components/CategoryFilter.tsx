import React from 'react';
import {
  Button,
  ButtonGroup,
  Box,
  SimpleGrid,
  useBreakpointValue
} from '@chakra-ui/react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelect
}) => {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const columns = useBreakpointValue({ base: 2, md: categories.length <= 6 ? categories.length : 6 });

  return (
    <Box w="100%">
      <SimpleGrid columns={columns} spacing={2}>
        {categories.map((category) => (
          <Button
            key={category}
            size={buttonSize}
            variant={selectedCategory === category ? 'solid' : 'outline'}
            colorScheme={selectedCategory === category ? 'blue' : 'gray'}
            onClick={() => onSelect(category)}
            w="100%"
          >
            {category}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CategoryFilter;