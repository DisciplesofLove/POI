import React, { useState } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  Box
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search AI models...'
}) => {
  const [value, setValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <Box w="100%">
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.400" />}
        />
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          size="md"
          borderRadius="md"
          _focus={{
            boxShadow: 'outline',
            borderColor: 'blue.500'
          }}
        />
      </InputGroup>
    </Box>
  );
};

export default SearchBar;