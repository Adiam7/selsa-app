/**
 * Location utilities - address validation and helpers
 */

import type { AddressErrors } from './types';

/**
 * Validate address fields
 */
export const validateAddress = (
  country: string,
  state: string,
  city: string,
  zip: string,
  street: string
): AddressErrors => {
  const errors: AddressErrors = {};

  if (!country?.trim()) {
    errors.country = 'Country is required';
  }

  if (!state?.trim()) {
    errors.state = 'State/Province is required';
  }

  if (!city?.trim()) {
    errors.city = 'City is required';
  }

  if (!zip?.trim()) {
    errors.zip = 'ZIP/Postal code is required';
  }

  if (!street?.trim()) {
    errors.street = 'Street address is required';
  }

  return errors;
};

/**
 * Check if address is valid
 */
export const isAddressValid = (
  country: string,
  state: string,
  city: string,
  zip: string,
  street: string
): boolean => {
  const errors = validateAddress(country, state, city, zip, street);
  return Object.keys(errors).length === 0;
};
