/**
 * Location data types
 */

export interface Country {
  code: string;
  name: string;
}

export interface Province {
  name: string;
  code: string;
}

export interface Address {
  country: string;
  state: string;
  city: string;
  zip: string;
  street: string;
}

export interface AddressErrors {
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  street?: string;
}
