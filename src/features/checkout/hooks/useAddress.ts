/**
 * Custom hook for address management
 * Handles country selection, province/state selection, city auto-fill, and validation
 */

import { useState, useCallback } from 'react';
import {
  searchCountries,
  searchProvinces,
  getProvinceCode,
  getCityForState,
  validateAddress,
} from '@/lib/locations';
import type { AddressErrors } from '@/lib/locations/types';

interface UseAddressReturn {
  // Display state
  countrySearch: string;
  countryOpen: boolean;
  provinceSearch: string;
  provinceOpen: boolean;
  
  // Data
  country: string;
  state: string;
  city: string;
  zip: string;
  street: string;
  errors: AddressErrors;

  // Handlers
  setCountrySearch: (value: string) => void;
  setCountryOpen: (value: boolean) => void;
  setCountry: (code: string) => void;
  
  setProvinceSearch: (value: string) => void;
  setProvinceOpen: (value: boolean) => void;
  setState: (stateName: string) => void;
  
  setCity: (city: string) => void;
  setZip: (zip: string) => void;
  setStreet: (street: string) => void;
  
  setErrors: (errors: AddressErrors) => void;
  clearErrors: () => void;
  
  // Validation
  validate: () => boolean;
  getFilteredCountries: () => ReturnType<typeof searchCountries>;
  getFilteredProvinces: () => ReturnType<typeof searchProvinces>;
}

export const useAddress = (defaultCountry: string = 'US'): UseAddressReturn => {
  // Display state for autocomplete dropdowns
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [provinceOpen, setProvinceOpen] = useState(false);

  // Address data
  const [country, setCountry] = useState(defaultCountry);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [street, setStreet] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<AddressErrors>({});

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Validate address
  const validate = useCallback((): boolean => {
    const newErrors = validateAddress(country, state, city, zip, street);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [country, state, city, zip, street]);

  // Get filtered countries
  const getFilteredCountries = useCallback(() => {
    return searchCountries(countrySearch);
  }, [countrySearch]);

  // Get filtered provinces
  const getFilteredProvinces = useCallback(() => {
    return searchProvinces(country, provinceSearch);
  }, [country, provinceSearch]);

  return {
    // Display state
    countrySearch,
    countryOpen,
    provinceSearch,
    provinceOpen,

    // Data
    country,
    state,
    city,
    zip,
    street,
    errors,

    // Handlers
    setCountrySearch,
    setCountryOpen,
    setCountry,
    setProvinceSearch,
    setProvinceOpen,
    setState,
    setCity,
    setZip,
    setStreet,
    setErrors,
    clearErrors,

    // Validation
    validate,
    getFilteredCountries,
    getFilteredProvinces,
  };
};
