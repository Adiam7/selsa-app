import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock next/navigation for router + params
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ type: 'beauty' }),
}));

import AdminNewLocalProductByTypePage from '../page';

describe('Beauty selection page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows only the 3 selection buttons and navigates on click', async () => {
    render(<AdminNewLocalProductByTypePage />);

    expect(screen.getByRole('button', { name: 'Hair' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Perfume' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Body Scrub' })).toBeInTheDocument();

    // Ensure form fields are not present on the selection page
    expect(screen.queryByLabelText('Name (EN)')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hair' }));
    expect(pushMock).toHaveBeenCalledWith('/admin/products/new/beauty/hair');
  });
});
