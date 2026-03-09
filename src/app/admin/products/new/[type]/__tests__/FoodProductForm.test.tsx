import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';



import { FoodProductForm } from '../_components/FoodProductForm';
import { ToastProvider } from '@/components/Toast';

// Mock router + api client (adminProducts functions are spied below)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));


import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('FoodProductForm (unit)', () => {
  // increase timeout for UI interactions in full-suite runs
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as any);
  });

  it('submits weight as a number when provided', async () => {
    jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 123 } as any);

    const { container } = render(
      <ToastProvider>
        <FoodProductForm />
      </ToastProvider>
    );

    // debug: initial DOM + labels
    // eslint-disable-next-line no-console
    console.log('FoodForm initial container:', container.innerHTML.slice(0, 2000));
    // eslint-disable-next-line no-console
    console.log('FoodForm labels:', Array.from(document.querySelectorAll('label')).map((l) => l.textContent));

    // Fill English name
    const nameEn = screen.getByLabelText('Name (EN) *');
    fireEvent.change(nameEn, { target: { value: 'Spiced Tea' } });

    // Switch to Tigrinya tab and fill TI name
    await userEvent.click(screen.getByText('Tigrinya'));
    // debug: DOM after tab switch
    // eslint-disable-next-line no-console
    console.log('After TI click labels:', Array.from(document.querySelectorAll('label')).map((l) => l.textContent));

    const nameTi = await screen.findByLabelText('Name (TI) *');
    fireEvent.change(nameTi, { target: { value: 'ቅመማ ሻሂ' } });
    await waitFor(() => expect(nameTi).toHaveValue('ቅመማ ሻሂ'));

    // Price
    const price = screen.getByLabelText('Price');
    fireEvent.change(price, { target: { value: '3.50' } });
    await waitFor(() => expect(price).toHaveValue('3.50'));

    // Weight input
    const weight = screen.getByLabelText('Weight (kg)');
    fireEvent.change(weight, { target: { value: '0.250' } });
    // input normalizes to 0.25 in the UI (normalize and assert numerically)
    await waitFor(() => expect(Number((weight as HTMLInputElement).value)).toBeCloseTo(0.25));

    // Click Create
    userEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(adminProducts.createAdminLocalProduct).toHaveBeenCalled());
    const payload = (adminProducts.createAdminLocalProduct as jest.Mock).mock.calls[0][0];
    expect(payload).toHaveProperty('weight');
    // Ensure numeric (not string) and approximate value
    expect(typeof payload.weight).toBe('number');
    expect(payload.weight).toBeCloseTo(0.25);
  });

  it('omits weight from payload when left blank', async () => {
    jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 124 } as any);

    render(
      <ToastProvider>
        <FoodProductForm />
      </ToastProvider>
    );

    // Fill required fields only
    await userEvent.type(screen.getByLabelText('Name (EN) *'), 'Tea');
    await userEvent.click(screen.getByText('Tigrinya'));
    await userEvent.type(await screen.findByLabelText('Name (TI) *'), 'ቡና');
    await userEvent.type(screen.getByLabelText('Price'), '5.00');

    // Leave weight empty and submit
    userEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(adminProducts.createAdminLocalProduct).toHaveBeenCalled());

    const payload = (adminProducts.createAdminLocalProduct as jest.Mock).mock.calls[0][0];
    expect(payload).not.toHaveProperty('weight');
  });
});