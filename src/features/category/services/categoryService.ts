import { apiClient } from '@/lib/api/client';
import { Category } from '@/types/category';
// src/features/category/services/categoryService.ts
// import { Category } from "@/types/product";


export interface CreateCategoryInput {
  name: string;
  slug?: string;
  parentId?: number | null;
  description?: string;
  imageUrl?: string;
}

// ✅ Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories/');
  return response.data;
}

// ✅ Fetch category by ID
export async function fetchCategoryById(id: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${id}/`);
  return response.data;
}

// ✅ Create new category
export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const response = await apiClient.post<Category>('/categories/', data);
  return response.data;
}


export const categoryService = {
  // 🔹 Fetch all categories
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories/');
    return res.data;
  },

  // 🔹 Get a single category by slug
  async getBySlug(slug: string): Promise<Category> {
    const res = await apiClient.get<Category>(`/categories/${slug}/`);
    return res.data;
  },

  // 🔹 Create a new category
  async create(data: Partial<Category>): Promise<Category> {
    const res = await apiClient.post<Category>('/categories/', data);
    return res.data;
  },

  // 🔹 Update a category by slug
  async update(slug: string, data: Partial<Category>): Promise<Category> {
    const res = await apiClient.patch<Category>(`/categories/${slug}/`, data);
    return res.data;
  },

  // 🔹 Delete a category by slug
  async remove(slug: string): Promise<void> {
    await apiClient.delete(`/categories/${slug}/`);
  },
};
