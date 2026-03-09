import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { BeautyProductForm } from '../_components/BeautyProductForm';
import { ToastProvider } from '@/components/Toast';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('BeautyProductForm (unit)', () => {
  // UI-heavy form tests can be slow in full-suite CI — increase timeout
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits hair-extensions payload when hair subcategory selected', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-hair', slug: 'hair', path_slugs: 'beauty/hair', path_name_en: 'Hair' },
      ],
    } as any);

    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 321 } as any);

    render(
      <ToastProvider>
        <BeautyProductForm />
      </ToastProvider>
    );

    // Fill common required fields
    await userEvent.type(screen.getByLabelText('Name (EN)'), 'Premium Extensions');
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '129.00' } });

    // Choose Hair via the new quick buttons (inside the dedicated group)
    const group = screen.getByRole('group', { name: 'beauty-subcategory-buttons' });
    await userEvent.click(within(group).getByRole('button', { name: 'Hair' }));

    // Fill hair-specific fields
    fireEvent.change(screen.getByLabelText('Hair type'), { target: { value: 'Human Hair' } });
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '18 inches' } });
    fireEvent.click(screen.getByLabelText('Virgin hair'));

    // images upload should be present for hair
    expect(screen.getByText('Upload images')).toBeInTheDocument();

    // Submit
    userEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    const payload = createSpy.mock.calls[0][0];

    expect(payload.product_type).toBe('hair');
    expect(payload.hair_type?.en).toBe('Human Hair');
    expect(payload.length?.en).toBe('18 inches');
    expect(payload.is_virgin).toBe(true);
  });

  it('renders stock control and stock quantity side-by-side for hair', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-hair', slug: 'hair', path_slugs: 'beauty/hair', path_name_en: 'Hair' },
      ],
    } as any);

    render(
      <ToastProvider>
        <BeautyProductForm />
      </ToastProvider>
    );

    await userEvent.type(screen.getByLabelText('Name (EN)'), 'Test Hair');
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '10.00' } });

    const group = screen.getByRole('group', { name: 'beauty-subcategory-buttons' });
    await userEvent.click(within(group).getByRole('button', { name: 'Hair' }));

    const stockControlLabel = screen.getByText('Stock control');
    const stockQtyInput = screen.getByLabelText('Stock quantity');

    // both controls should live inside the same inner-grid wrapper for hair
    expect(stockControlLabel.parentElement?.parentElement).toContainElement(stockQtyInput);
  });

  it('submits perfume payload when perfume subcategory selected', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-perfume', slug: 'perfume', path_slugs: 'beauty/perfume', path_name_en: 'Perfume' },
      ],
    } as any);

    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 322 } as any);

    render(
      <ToastProvider>
        <BeautyProductForm />
      </ToastProvider>
    );

    await userEvent.type(screen.getByLabelText('Name (EN)'), 'Citrus Splash');
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '45.00' } });

    // Choose Perfume via the new quick buttons (inside the dedicated group)
    const group = screen.getByRole('group', { name: 'beauty-subcategory-buttons' });
    await userEvent.click(within(group).getByRole('button', { name: 'Perfume' }));

    fireEvent.change(screen.getByLabelText('Volume (ml)'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Concentration'), { target: { value: 'Eau de Parfum' } });
    fireEvent.change(screen.getByLabelText('Fragrance family'), { target: { value: 'Citrus' } });
    fireEvent.change(screen.getByLabelText('Scent notes'), { target: { value: 'bergamot, lemon' } });

    // fragrance family and scent notes should be side-by-side
    const familyInput = screen.getByLabelText('Fragrance family');
    const scentInput = screen.getByLabelText('Scent notes');
    expect(familyInput.parentElement?.parentElement).toBe(scentInput.parentElement?.parentElement);

    // images upload should be present for perfume
    expect(screen.getByText('Upload images')).toBeInTheDocument();

    // stock controls should render side-by-side for perfume
    const stockControlLabel = screen.getByText('Stock control');
    const stockQtyInput = screen.getByLabelText('Stock quantity');
    expect(stockControlLabel.parentElement?.parentElement).toContainElement(stockQtyInput);

    userEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    const payload = createSpy.mock.calls[0][0];

    expect(payload.product_type).toBe('perfume');
    expect(payload.volume_ml).toBeCloseTo(50);
    expect(payload.concentration).toBe('Eau de Parfum');
    expect(payload.fragrance_family).toBe('Citrus');
    expect(payload.scent_notes?.en).toBe('bergamot, lemon');
  });

  it('submits body-scrub payload and converts weight to number', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-scrub', slug: 'body-scrub', path_slugs: 'beauty/body-scrub', path_name_en: 'Body Scrub' },
      ],
    } as any);

    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 323 } as any);

    render(
      <ToastProvider>
        <BeautyProductForm />
      </ToastProvider>
    );

    await userEvent.type(screen.getByLabelText('Name (EN)'), 'Salt Glow');
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '12.50' } });

    // Choose Body Scrub via the new quick buttons (inside the dedicated group)
    const group = screen.getByRole('group', { name: 'beauty-subcategory-buttons' });
    await userEvent.click(within(group).getByRole('button', { name: 'Body Scrub' }));

    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '0.250' } });
    fireEvent.change(screen.getByLabelText('Ingredients'), { target: { value: 'Sea salt, oil' } });
    fireEvent.click(screen.getByLabelText('Organic'));

    // images upload should be present for body-scrub
    expect(screen.getByText('Upload images')).toBeInTheDocument();

    // stock controls should render side-by-side for body-scrub
    const stockControlLabel = screen.getByText('Stock control');
    const stockQtyInput = screen.getByLabelText('Stock quantity');
    expect(stockControlLabel.parentElement?.parentElement).toContainElement(stockQtyInput);

    userEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    const payload = createSpy.mock.calls[0][0];

    expect(payload.product_type).toBe('body-scrub');
    expect(typeof payload.weight).toBe('number');
    expect(payload.weight).toBeCloseTo(0.25);
    expect(payload.ingredients?.en).toBe('Sea salt, oil');
    expect(payload.is_organic).toBe(true);
  });
});
