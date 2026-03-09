import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { AdminLocalProductForm } from '../LocalProductForm';
import { ToastProvider } from '@/components/Toast';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { apiClient } from '@/lib/api/client';

describe('AdminLocalProductForm (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows EN/TI tabs and switches name/description labels', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [] } as any);

    render(
      <ToastProvider>
        <AdminLocalProductForm />
      </ToastProvider>
    );

    // default language = EN
    expect(await screen.findByLabelText(/Name \(EN\)/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Description \(EN\)/)).toBeInTheDocument();

    // switch to TI
    await userEvent.click(screen.getByRole('tab', { name: 'TI' }));
    expect(await screen.findByLabelText(/Name \(TI\)/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Description \(TI\)/)).toBeInTheDocument();
  });
});
