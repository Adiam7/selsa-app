import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { ClothesProductForm } from '../_components/ClothesProductForm';
import { ToastProvider } from '@/components/Toast';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('ClothesProductForm (unit)', () => {
  jest.setTimeout(20000);

  beforeAll(() => {
    // Radix UI Select requires pointer capture and scroll APIs not available in jsdom
    if (!window.Element.prototype.hasPointerCapture) {
      window.Element.prototype.hasPointerCapture = jest.fn(() => false);
    }
    if (!window.Element.prototype.setPointerCapture) {
      window.Element.prototype.setPointerCapture = jest.fn();
    }
    if (!window.Element.prototype.releasePointerCapture) {
      window.Element.prototype.releasePointerCapture = jest.fn();
    }
    if (!window.Element.prototype.scrollIntoView) {
      window.Element.prototype.scrollIntoView = jest.fn();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits clothing payload with sizes, colors, material and care_instructions', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-clothes', slug: 'clothes', path_slugs: 'clothes', path_name_en: 'Clothes' },
        { id: 'c-ts', slug: 't-shirts', path_slugs: 'clothes/t-shirts', path_name_en: "T-Shirts" },
      ],
    } as any);

    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 999 } as any);

    render(
      <ToastProvider>
        <ClothesProductForm />
      </ToastProvider>
    );

    // Fill required fields
    await userEvent.type(screen.getByLabelText('Product Title'), 'Classic Tee');
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '19.99' } });

    // Fill clothes-specific
    fireEvent.change(screen.getByLabelText('Sizes (comma separated)'), { target: { value: 'S, M, L' } });
    fireEvent.change(screen.getByLabelText('Colors (comma separated)'), { target: { value: 'Red, Blue' } });

    // material and care instructions (EN)
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'Cotton' } });
    fireEvent.change(screen.getByLabelText('Care instructions'), { target: { value: 'Machine wash cold' } });

    // selects: gender + fit
    await userEvent.click(screen.getByTestId('gender-select')); // open select
    await userEvent.click(screen.getByText('Unisex'));

    await userEvent.click(screen.getByTestId('fit-select')); // open select
    await userEvent.click(screen.getByText('Regular'));

    // optional: size chart + weight
    fireEvent.change(screen.getByLabelText('Size chart URL (optional)'), { target: { value: 'https://example.com/size.png' } });
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '0.250' } });

    // Submit
    userEvent.click(screen.getByTestId('create-product-button'));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    const payload = createSpy.mock.calls[0][0];

    expect(payload.product_type).toBe('product');
    expect(payload.sizes).toEqual(['S', 'M', 'L']);
    expect(payload.colors).toEqual(['Red', 'Blue']);
    expect(payload.material?.en).toBe('Cotton');
    expect(payload.care_instructions?.en).toBe('Machine wash cold');
    expect(payload.gender).toBe('unisex');
    expect(payload.fit).toBe('regular');
    expect(payload.size_chart_url).toBe('https://example.com/size.png');
    expect(typeof payload.weight).toBe('number');
    expect(payload.weight).toBeCloseTo(0.25);
  });
});
