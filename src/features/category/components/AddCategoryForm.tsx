'use client'
import React, { useState } from 'react';
import { useCreateCategory } from '../hooks/useCreateCategory';

export const AddCategoryForm = () => {
  const [name, setName] = useState('');
  const mutation = useCreateCategory();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    try {
      await mutation.mutateAsync({ name });
      setName('');
      alert('Category added successfully!');
    } catch (error) {
      alert('Failed to add category');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={mutation.isPending}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add Category'}
      </button>
      {mutation.isError && <p style={{ color: 'red' }}>Error adding category.</p>}
    </form>
  );
};
