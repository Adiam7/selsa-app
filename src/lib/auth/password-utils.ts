// src/lib/auth/password-utils.ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// ----- Client-side validation utilities -----

/**
 * Validates a password: min 8 chars, at least one uppercase, one lowercase,
 * one digit, and one special character.
 */
export function isValidPassword(password: string): boolean {
  if (!password) return false;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validates an email address.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Must have local@domain.tld without leading/trailing dots in domain
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates a name: 2-50 chars, allows letters, spaces, hyphens, apostrophes.
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) return false;
  // Must not contain digits or most special characters
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;
  return nameRegex.test(trimmed);
}

/**
 * Validates a phone number: supports 10-12 digit formats including international
 * prefixes (e.g. +1, +251).
 * Valid examples: '1234567890', '+1-123-456-7890', '+251911123456'
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;
  // Strip common formatting: spaces, dashes, parentheses
  const stripped = trimmed.replace(/[\s\-().]/g, '');
  // Accept optional + prefix then 10-12 digits
  const phoneRegex = /^\+?\d{10,12}$/;
  return phoneRegex.test(stripped);
}

/**
 * Returns a password strength score (0-4):
 * - 1 point each for: uppercase, lowercase, digit, special char
 * Weak: < 2, Medium: 2-3, Strong: 4
 */
export function isValidPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z\d]/.test(password)) score++;
  return score;
}

/**
 * Validates that a confirmation password matches the original.
 * Treats null === null and undefined === undefined as equal (both falsy), returns true.
 */
export function isValidConfirmPassword(password: string, confirmPassword: string): boolean {
  // null == null, undefined == undefined → equal
  // eslint-disable-next-line eqeqeq
  if (password == null && confirmPassword == null) return true;
  // eslint-disable-next-line eqeqeq
  if (password == null || confirmPassword == null) return false;
  return password === confirmPassword;
}

// ----- Legacy commented helpers below -----

// export function isValidUsername(username: string): boolean {
//   // Username must be alphanumeric and between 3-20 characters
//   const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
//   return usernameRegex.test(username);
// }
// export function isValidAddress(address: string): boolean {
//   // Address must be between 5-100 characters
//   return address.length >= 5 && address.length <= 100;
// }
// export function isValidZipCode(zip: string): boolean {
//   // Simple zip code validation (5 digits)
//   const zipRegex = /^\d{5}$/;
//   return zipRegex.test(zip);
// }
// export function isValidCity(city: string): boolean {
//   // City must contain only letters and spaces, and be between 2-50 characters
//   const cityRegex = /^[a-zA-Z\s]{2,50}$/;
//   return cityRegex.test(city);
// }
// export function isValidState(state: string): boolean {
//   // State must contain only letters and be between 2-50 characters
//   const stateRegex = /^[a-zA-Z\s]{2,50}$/;
//   return stateRegex.test(state);
// }
// export function isValidCountry(country: string): boolean {
//   // Country must contain only letters and be between 2-50 characters
//   const countryRegex = /^[a-zA-Z\s]{2,50}$/;
//   return countryRegex.test(country);
// }                   
// export function isValidCreditCard(cardNumber: string): boolean {
//   // Simple credit card validation (16 digits)
//   const cardRegex = /^\d{16}$/;
//   return cardRegex.test(cardNumber);
// }
// export function isValidCVV(cvv: string): boolean {
//   // CVV must be 3 digits
//   const cvvRegex = /^\d{3}$/;
//   return cvvRegex.test(cvv);
// }
// export function isValidExpirationDate(expirationDate: string): boolean {
//   // Expiration date must be in MM/YY format
//   const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
//   return expirationRegex.test(expirationDate);
// }
// export function isValidShippingMethod(method: string): boolean {
//   // Shipping method must be one of the predefined options
//   const validMethods = ["standard", "express", "overnight"];
//   return validMethods.includes(method.toLowerCase());
// }
// export function isValidPaymentMethod(method: string): boolean {
//   // Payment method must be one of the predefined options
//   const validMethods = ["credit_card", "paypal", "bank_transfer"];
//   return validMethods.includes(method.toLowerCase());
// }
// export function isValidOrderStatus(status: string): boolean {
//   // Order status must be one of the predefined options
//   const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
//   return validStatuses.includes(status.toLowerCase());
// }
// export function isValidProductCategory(category: string): boolean {
//   // Product category must be one of the predefined options
//   const validCategories = ["electronics", "clothing", "home", "books", "toys"];
//   return validCategories.includes(category.toLowerCase());
// }
// export function isValidProductName(name: string): boolean {
//   // Product name must be between 2-100 characters
//   return name.length >= 2 && name.length <= 100;
// }
// export function isValidProductDescription(description: string): boolean {
//   // Product description must be between 10-500 characters
//   return description.length >= 10 && description.length <= 500;
// }
// export function isValidProductPrice(price: number): boolean {