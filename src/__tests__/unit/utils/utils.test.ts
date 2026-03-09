/**
 * Unit Tests for Utility Functions
 * Tests individual utility functions in isolation
 */

import { cn } from '@/lib/utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Mock dependencies
jest.mock('clsx');
jest.mock('tailwind-merge');

const mockClsx = clsx as jest.MockedFunction<typeof clsx>;
const mockTwMerge = twMerge as jest.MockedFunction<typeof twMerge>;

describe('Utils - cn function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call clsx with correct arguments', () => {
    const inputs = ['class1', 'class2', { 'class3': true }];
    mockClsx.mockReturnValue('mocked-clsx-output');
    mockTwMerge.mockReturnValue('final-output');
    
    cn(...inputs);
    
    expect(mockClsx).toHaveBeenCalledWith(...inputs);
    expect(mockClsx).toHaveBeenCalledTimes(1);
  });

  it('should call twMerge with clsx output', () => {
    const clsxOutput = 'mocked-clsx-output';
    mockClsx.mockReturnValue(clsxOutput);
    mockTwMerge.mockReturnValue('final-output');
    
    cn('class1', 'class2');
    
    expect(mockTwMerge).toHaveBeenCalledWith(clsxOutput);
    expect(mockTwMerge).toHaveBeenCalledTimes(1);
  });

  it('should return twMerge output', () => {
    const expectedOutput = 'merged-tailwind-classes';
    mockClsx.mockReturnValue('clsx-output');
    mockTwMerge.mockReturnValue(expectedOutput);
    
    const result = cn('class1', 'class2');
    
    expect(result).toBe(expectedOutput);
  });

  it('should handle empty inputs', () => {
    mockClsx.mockReturnValue('');
    mockTwMerge.mockReturnValue('');
    
    const result = cn();
    
    expect(mockClsx).toHaveBeenCalledWith();
    expect(result).toBe('');
  });

  it('should handle single class input', () => {
    const singleClass = 'single-class';
    mockClsx.mockReturnValue(singleClass);
    mockTwMerge.mockReturnValue(singleClass);
    
    const result = cn(singleClass);
    
    expect(mockClsx).toHaveBeenCalledWith(singleClass);
    expect(result).toBe(singleClass);
  });

  it('should handle conditional classes', () => {
    const conditionalInput = { 'active': true, 'disabled': false };
    mockClsx.mockReturnValue('active');
    mockTwMerge.mockReturnValue('active');
    
    cn(conditionalInput);
    
    expect(mockClsx).toHaveBeenCalledWith(conditionalInput);
  });

  it('should handle mixed input types', () => {
    const mixedInputs = [
      'base-class',
      { 'conditional': true },
      undefined,
      'another-class'
    ];
    
    cn(...mixedInputs);
    
    expect(mockClsx).toHaveBeenCalledWith(...mixedInputs);
  });
});