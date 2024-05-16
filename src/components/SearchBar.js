import React, { useState } from 'react';
import {
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const SearchBar = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const toast = useToast();

  const handleInputChange = (event) => setInputValue(event.target.value);

  const handleSearch = () => {
    if (!inputValue.trim()) {
      toast({
        title: 'Please enter an app name.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSearch(inputValue.trim());
  };

  return (
    <InputGroup>
      <Input
        placeholder="Enter app name..."
        value={inputValue}
        onChange={handleInputChange}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleSearch}>
          <SearchIcon />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchBar;
