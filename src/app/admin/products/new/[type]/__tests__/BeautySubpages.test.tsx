import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// mock router first
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import AddHairPage from '../hair/page';
import AddPerfumePage from '../perfume/page';
import AddBodyScrubPage from '../body-scrub/page';
import { apiClient } from '@/lib/api/client';
import { ToastProvider } from '@/components/Toast';

describe('Beauty subcategory pages — back link & category sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for all apiClient.get calls to prevent real network requests
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as any);
  });

  it('renders a Back button that navigates to the selector page', async () => {
    render(
      <ToastProvider>
        <AddHairPage />
      </ToastProvider>
    );

    const back = screen.getByRole('button', { name: /Back to Beauty selection/i });
    expect(back).toBeInTheDocument();

    await userEvent.click(back);
    expect(pushMock).toHaveBeenCalledWith('/admin/products/new/beauty');
  });

  it('pre-selects matching category when initialSubcategory is provided (hair)', async () => {
    // categories API should return beauty + hair entries so the form can pick the category
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-hair', slug: 'hair', path_slugs: 'beauty/hair', path_name_en: 'Hair' },
      ],
    } as any);

    render(
      <ToastProvider>
        <AddHairPage />
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByTestId('category-chip-hair')).toBeInTheDocument());
    // chip should be in selected state because initialSubcategory='hair' should sync categoryId
    expect(screen.getByTestId('category-chip-hair')).toHaveClass('bg-muted/30');

    // also show read-only preselected subcategory text when hideSelector is used
    expect(screen.getByTestId('preselected-subcategory')).toHaveTextContent('Hair');

    // preselected-subcategory should appear side-by-side with Price
    const priceInput = screen.getByLabelText('Price');
    expect(priceInput.parentElement?.parentElement).toContainElement(screen.getByTestId('preselected-subcategory'));
  });

  it('pre-selects matching category and shows readonly label for perfume/body-scrub', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-perfume', slug: 'perfume', path_slugs: 'beauty/perfume', path_name_en: 'Perfume' },
      ],
    } as any);

    render(
      <ToastProvider>
        <AddPerfumePage />
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByTestId('category-chip-perfume')).toBeInTheDocument());
    expect(screen.getByTestId('category-chip-perfume')).toHaveClass('bg-muted/30');
    expect(screen.getByTestId('preselected-subcategory')).toHaveTextContent('Perfume');

    // teardown before next render so test ids don't collide
    cleanup();

    // body-scrub
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        { id: 'c-beauty', slug: 'beauty', path_slugs: 'beauty', path_name_en: 'Beauty' },
        { id: 'c-scrub', slug: 'body-scrub', path_slugs: 'beauty/body-scrub', path_name_en: 'Body Scrub' },
      ],
    } as any);

    render(
      <ToastProvider>
        <AddBodyScrubPage />
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByTestId('category-chip-body-scrub')).toBeInTheDocument());
    expect(screen.getByTestId('category-chip-body-scrub')).toHaveClass('bg-muted/30');
    expect(screen.getByTestId('preselected-subcategory')).toHaveTextContent('Body Scrub');

    // preselected-subcategory should appear side-by-side with Price for body-scrub
    const priceInputScrub = screen.getByLabelText('Price');
    expect(priceInputScrub.parentElement?.parentElement).toContainElement(screen.getByTestId('preselected-subcategory'));
  });
});
