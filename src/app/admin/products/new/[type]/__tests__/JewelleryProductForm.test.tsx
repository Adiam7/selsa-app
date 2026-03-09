import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { JewelleryProductForm } from '../_components/JewelleryProductForm';
import { ToastProvider } from '@/components/Toast';

// Mock router + api client
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('JewelleryProductForm (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as any);
  });

  it('includes jewellery fields in payload when provided', async () => {
    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 999 } as any);

    render(
      <ToastProvider>
        <JewelleryProductForm />
      </ToastProvider>
    );

    // Fill EN fields
    fireEvent.change(screen.getByLabelText('Product Title'), { target: { value: 'Gold Ring' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '149.00' } });

    // Switch to TI and fill TI title
    await userEvent.click(screen.getByText('TI'));
    const titleTi = await screen.findByLabelText('Product Title');
    fireEvent.change(titleTi, { target: { value: 'ወርቅ ቀንድ' } });

    // Back to EN and fill jewellery-specific fields
    await userEvent.click(screen.getByText('EN'));
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'Gold' } });
    fireEvent.change(screen.getByLabelText('Gemstone'), { target: { value: 'Diamond' } });
    fireEvent.change(screen.getByLabelText('Weight (g)'), { target: { value: '1.25' } });
    fireEvent.change(screen.getByLabelText('Purity / Karat'), { target: { value: '18K' } });
    fireEvent.change(screen.getByLabelText('Certification'), { target: { value: 'GIA' } });
    fireEvent.click(screen.getByLabelText('Handmade'));

    // attach an image
    const uploadSpy = jest.spyOn(adminProducts, 'uploadAdminLocalProductImage').mockResolvedValue({} as any);
    const file = new File(['dummy'], 'ring.jpg', { type: 'image/jpeg' });
    const imagesInput = screen.getByLabelText('Images') as HTMLInputElement;
    fireEvent.change(imagesInput, { target: { files: [file] } });

    // Submit
    userEvent.click(screen.getByText('Create Jewellery'));

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    await waitFor(() => expect(uploadSpy).toHaveBeenCalled());

    const payload = createSpy.mock.calls[0][0];
    expect(payload.product_type).toBe('jewellery');
    expect(payload.material?.en).toBe('Gold');
    expect(payload.gemstone?.en).toBe('Diamond');
    expect(typeof payload.weight).toBe('number');
    expect(payload.weight).toBeCloseTo(1.25);
    expect(payload.purity?.en).toBe('18K');
    expect(payload.certification?.en).toBe('GIA');
    expect(payload.is_handmade).toBe(true);

    // upload called with created id and the attached file
    expect(uploadSpy.mock.calls[0][0]).toBe(999);
    expect(uploadSpy.mock.calls[0][1].name).toBe('ring.jpg');
  });
});
