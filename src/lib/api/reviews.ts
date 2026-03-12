/**
 * Reviews API — communicates with /api/reviews/<productId>/
 */

import { apiClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────
export interface ReviewData {
  id: number;
  username: string;
  rating: number;
  title: string;
  text: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ReviewStats {
  average_rating: number;
  review_count: number;
  rating_distribution: Record<string, number>;
}

export interface ReviewSubmitPayload {
  rating: number;
  title?: string;
  text?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Endpoints ────────────────────────────────────────────────────

/** List approved reviews for a product */
export async function fetchReviews(
  productId: number,
  page = 1
): Promise<PaginatedResponse<ReviewData>> {
  const res = await apiClient.get<PaginatedResponse<ReviewData>>(
    `/reviews/${productId}/`,
    { params: { page } }
  );
  return res.data;
}

/** Get aggregate stats (avg rating, count, distribution) */
export async function fetchReviewStats(
  productId: number
): Promise<ReviewStats> {
  const res = await apiClient.get<ReviewStats>(
    `/reviews/${productId}/stats/`
  );
  return res.data;
}

/** Submit a new review (auth required) */
export async function submitReview(
  productId: number,
  payload: ReviewSubmitPayload
): Promise<ReviewData> {
  const res = await apiClient.post<ReviewData>(
    `/reviews/${productId}/`,
    payload
  );
  return res.data;
}

/** Get current user's review on this product (auth required) */
export async function fetchMyReview(
  productId: number
): Promise<ReviewData | null> {
  try {
    const res = await apiClient.get<ReviewData>(
      `/reviews/${productId}/mine/`
    );
    // Backend returns 204 No Content when user hasn't reviewed yet
    if (res.status === 204 || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}
