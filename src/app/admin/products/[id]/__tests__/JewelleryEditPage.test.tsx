import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation router + params used by the page
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: '123' }),
}));

import AdminEditProductPage from '@/app/admin/products/[id]/edit/page';
import { ToastProvider } from '@/components/Toast';

import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('AdminEditProductPage — jewellery edit flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the categories API call via apiClient
    jest.spyOn(apiClient, 'get').mockImplementation((url: string) => {
      if (url.includes('categories')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
  });

  it('loads jewellery detail, allows edit and includes jewellery fields in update payload', async () => {
    const detail: Partial<adminProducts.AdminLocalProductDetail> = {
      product_type: 'jewellery',
      name: { en: 'Gold Ring', ti: 'የወርቅ ቀለበት' },
      sku: 'JEW-0001',
      price: '149.99',
      purity: { en: '18K' },
      certification: { en: 'GIA' },
      images: [],
      category_id: null,
      additional_category_ids: [],
      publish: false,
      stock_control: 'finite',
      stock_quantity: 1,
    } as any;

    jest.spyOn(adminProducts, 'getAdminLocalProductDetail').mockResolvedValue(detail as any);
    const updateSpy = jest.spyOn(adminProducts, 'updateAdminLocalProduct').mockResolvedValue(detail as any);

    render(
      <ToastProvider>
        <AdminEditProductPage />
      </ToastProvider>
    );

    // wait for detail to be loaded and fields populated (use stable selectors)
    await waitFor(() => expect(screen.getByTestId('sku-input')).toHaveValue('JEW-0001'));

    // assert jewellery-specific inputs are populated (purity and certification exist in page)
    expect(screen.getByTestId('purity-en-input')).toHaveValue('18K');
    expect(screen.getByTestId('certification-en-input')).toHaveValue('GIA');

    // change jewellery-specific fields and price
    fireEvent.change(screen.getByTestId('purity-en-input'), { target: { value: '24K' } });
    fireEvent.change(screen.getByTestId('certification-en-input'), { target: { value: 'IGI' } });
    fireEvent.change(screen.getByTestId('price-input'), { target: { value: '199.99' } });

    // click Save changes
    const saveBtn = screen.getByTestId('save-changes-button');
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());

    const payload = updateSpy.mock.calls[0][1];
    expect(payload.purity).toBeDefined();
    expect(payload.purity?.en).toBe('24K');
    expect(payload.certification?.en).toBe('IGI');
    expect(payload.price).toBe('199.99');
  });
});
