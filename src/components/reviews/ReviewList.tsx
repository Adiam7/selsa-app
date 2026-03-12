"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import type { ReviewData } from "@/lib/api/reviews";
import { StarRating } from "./StarRating";

interface ReviewListProps {
  reviews: ReviewData[];
  loading?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewList({ reviews, loading }: ReviewListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded border border-gray-200 p-4"
          >
            <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="mt-1 h-3 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {t("No reviews yet. Be the first to review this product!")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded border border-gray-200 p-4"
        >
          {/* Header row */}
          <div className="mb-1 flex items-center gap-2">
            <StarRating value={review.rating} size={16} />
            {review.is_verified_purchase && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {t("Verified Purchase")}
              </span>
            )}
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold text-sm">{review.title}</h4>
          )}

          {/* Body */}
          {review.text && (
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
              {review.text}
            </p>
          )}

          {/* Meta */}
          <p className="mt-2 text-xs text-gray-400">
            {review.username} &middot; {formatDate(review.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
