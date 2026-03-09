import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategoryInput, createCategory } from '../services/categoryService';
import { AxiosError } from 'axios';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: AxiosError) => {
      console.error('Error creating category:', error.message);
    },
  });
}
