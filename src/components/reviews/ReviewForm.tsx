"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import { submitReview } from "@/lib/api/reviews";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  productId: number;
  onSubmitted: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session?.user) {
    return (
      <p className="text-sm text-gray-500 italic">
        {t("Sign in to leave a review.")}
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("Please select a rating."));
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, { rating, title, text });
      toast.success(t("Review submitted! It will appear after moderation."));
      setRating(0);
      setTitle("");
      setText("");
      onSubmitted();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || t("Failed to submit review.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">{t("Write a Review")}</h3>

      {/* Star picker */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("Your Rating")}
        </label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-1">
          {t("Title")} <span className="text-gray-400">({t("optional")})</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder={t("Summarize your experience")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium mb-1">
          {t("Review")}
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={t("Share details of your experience with this product")}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="rounded bg-black px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? t("Submitting...") : t("Submit Review")}
      </button>
    </form>
  );
}
