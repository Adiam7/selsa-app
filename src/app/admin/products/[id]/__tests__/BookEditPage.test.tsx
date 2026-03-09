import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock next/navigation router used by the form
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// We'll test the Book form behavior (translated_by) using the create form which
// exercises the same inputs and payload logic as the edit page.
import { BookProductForm } from '@/app/admin/products/new/[type]/_components/BookProductForm';
import { ToastProvider } from '@/components/Toast';

import * as adminProducts from '@/lib/api/adminProducts';
import { apiClient } from '@/lib/api/client';

describe('Book form — translated_by field (create)', () => {
  // give these UI-heavy tests more time when running in full-suite CI
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
    // categories request
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as any);
  });

  it('includes translated_by in payload when provided', async () => {
    const createSpy = jest.spyOn(adminProducts, 'createAdminLocalProduct').mockResolvedValue({ id: 123 } as any);

    const { container } = render(
      <ToastProvider>
        <BookProductForm />
      </ToastProvider>
    );

    // debug: initial DOM + labels
    // eslint-disable-next-line no-console
    console.log('BookForm initial container:', container.innerHTML.slice(0, 2000));
    // eslint-disable-next-line no-console
    console.log('BookForm labels:', Array.from(document.querySelectorAll('label')).map((l) => l.textContent));

    // Fill required English fields
    fireEvent.change(screen.getByLabelText('Book Title'), { target: { value: 'Example Book' } });
    fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'Author Name' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '9.99' } });

    // sanity-check EN inputs accepted values (wait for React state to settle)
    await waitFor(() => expect(screen.getByLabelText('Book Title')).toHaveValue('Example Book'));
    await waitFor(() => expect(screen.getByLabelText('Author')).toHaveValue('Author Name'));
    await waitFor(() => expect(screen.getByLabelText('Price')).toHaveValue('9.99'));

    // Switch to TI tab and fill required TI fields (to satisfy validation)
    // eslint-disable-next-line no-console
    console.log('about to click TI tab');
    await userEvent.click(screen.getByText('TI'));
    // eslint-disable-next-line no-console
    console.log('TI tab clicked');
    // debug after tab switch
    // eslint-disable-next-line no-console
    console.log('After TI click labels:', Array.from(document.querySelectorAll('label')).map((l) => l.textContent));
    // eslint-disable-next-line no-console
    console.log('container after TI click:', container.innerHTML.slice(0, 4000));
    // eslint-disable-next-line no-console
    console.log('inputs after TI click:', Array.from(document.querySelectorAll('input')).map((i) => i.id));
    // eslint-disable-next-line no-console
    console.log('label.for for Book Title labels:', Array.from(document.querySelectorAll('label')).filter((l) => (l.textContent || '').includes('Book Title')).map((l) => l.getAttribute('for')));

    // directly select TI inputs by id ( avoids label lookup issues in test env )
    const titleTiInput = container.querySelector('#titleTi') as HTMLInputElement | null;
    expect(titleTiInput).not.toBeNull();
    if (titleTiInput) fireEvent.change(titleTiInput, { target: { value: 'ባህር መጽሐፍ' } });

    const authorTiInput = container.querySelector('#authorTi') as HTMLInputElement | null;
    expect(authorTiInput).not.toBeNull();
    if (authorTiInput) fireEvent.change(authorTiInput, { target: { value: 'ደራሲ' } });

    // confirm TI inputs have values
    expect(titleTiInput).toHaveValue('ባህር መጽሐፍ');
    expect(authorTiInput).toHaveValue('ደራሲ');

    // Fill translated_by on the TI tab (avoid switching back to EN in tests)
    const translatedByTiInput = container.querySelector('#translatedByTi') as HTMLInputElement | null;
    expect(translatedByTiInput).not.toBeNull();
    if (translatedByTiInput) {
      // use fireEvent.change to avoid intermittent userEvent.type flakiness in full-suite runs
      fireEvent.change(translatedByTiInput, { target: { value: 'Translator TI' } });
      // sanity-check the change applied
      expect(translatedByTiInput).toHaveValue('Translator TI');
    }

    // wait for form validation to enable the Add button
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add Book' })).not.toBeDisabled());
    const addBtn = screen.getByRole('button', { name: 'Add Book' }) as HTMLButtonElement;

    // Submit (Add Book)
    await userEvent.click(addBtn);

    // ensure API was called
    await waitFor(() => expect(createSpy).toHaveBeenCalled());

    const payload = createSpy.mock.calls[0][0];
    expect(payload.translated_by).toBeDefined();
    expect(payload.translated_by?.ti).toBe('Translator TI');
  });
});
