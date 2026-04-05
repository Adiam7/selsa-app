// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useTranslation } from "react-i18next";

// import {
//   fetchReviews,
//   fetchReviewStats,
//   fetchMyReview,
//   type ReviewData,
//   type ReviewStats,
// } from "@/lib/api/reviews";
// import { StarRating } from "./StarRating";
// import { ReviewList } from "./ReviewList";
// import { ReviewForm } from "./ReviewForm";

// interface ProductReviewsProps {
//   /** catalog.Product primary key */
//   productId: number | null;
// }

// /**
//  * Main reviews section that goes on the product detail page.
//  * Renders: summary bar · rating distribution · review list · write-a-review form.
//  */
// export function ProductReviews({ productId }: ProductReviewsProps) {
//   const { t } = useTranslation();
//   const { data: session } = useSession();

//   const [stats, setStats] = useState<ReviewStats | null>(null);
//   const [reviews, setReviews] = useState<ReviewData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(false);
//   const [hasOwnReview, setHasOwnReview] = useState(false);
//   const [showForm, setShowForm] = useState(false);

//   const loadReviews = useCallback(
//     async (p = 1) => {
//       if (!productId) return;
//       setLoading(true);
//       try {
//         const [statsData, reviewsData] = await Promise.all([
//           fetchReviewStats(productId),
//           fetchReviews(productId, p),
//         ]);
//         setStats(statsData);
//         if (p === 1) {
//           setReviews(reviewsData.results);
//         } else {
//           setReviews((prev) => [...prev, ...reviewsData.results]);
//         }
//         setHasMore(!!reviewsData.next);
//         setPage(p);
//       } catch {
//         // Silently fail – reviews aren't critical
//       } finally {
//         setLoading(false);
//       }
//     },
//     [productId]
//   );

//   // Check if user already has a review
//   useEffect(() => {
//     if (!productId || !session?.user) return;
//     fetchMyReview(productId).then((r) => setHasOwnReview(!!r));
//   }, [productId, session]);

//   useEffect(() => {
//     loadReviews(1);
//   }, [loadReviews]);

//   if (!productId) return null;

//   return (
//     <div className="mt-10 border-t border-gray-200 pt-8">
//       <h2 className="text-xl font-bold mb-4">{t("Customer Reviews")}</h2>

//       {/* ── Summary bar ─────────────────────────────────────────── */}
//       {stats && stats.review_count > 0 && (
//         <div className="mb-6 flex flex-col sm:flex-row gap-6">
//           {/* Left: big number + stars */}
//           <div className="flex flex-col items-center min-w-[120px]">
//             <span className="text-4xl font-bold">{stats.average_rating}</span>
//             <StarRating value={stats.average_rating} size={20} />
//             <span className="mt-1 text-sm text-gray-500">
//               {stats.review_count}{" "}
//               {stats.review_count === 1 ? t("review") : t("reviews")}
//             </span>
//           </div>

//           {/* Right: distribution bars */}
//           <div className="flex-1 space-y-1">
//             {[5, 4, 3, 2, 1].map((star) => {
//               const count = stats.rating_distribution[String(star)] || 0;
//               const pct =
//                 stats.review_count > 0
//                   ? Math.round((count / stats.review_count) * 100)
//                   : 0;
//               return (
//                 <div key={star} className="flex items-center gap-2 text-sm">
//                   <span className="w-8 text-right">{star}★</span>
//                   <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
//                     <div
//                       className="h-full rounded-full bg-amber-400"
//                       style={{ width: `${pct}%` }}
//                     />
//                   </div>
//                   <span className="w-8 text-gray-500">{count}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* ── Write a review toggle ───────────────────────────────── */}
//       {!hasOwnReview && session?.user && (
//         <div className="mb-6">
//           {!showForm ? (
//             <button
//               onClick={() => setShowForm(true)}
//               className="rounded border border-black px-4 py-2 text-sm font-medium hover:bg-gray-50"
//             >
//               {t("Write a Review")}
//             </button>
//           ) : (
//             <ReviewForm
//               productId={productId}
//               onSubmitted={() => {
//                 setShowForm(false);
//                 setHasOwnReview(true);
//                 loadReviews(1);
//               }}
//             />
//           )}
//         </div>
//       )}

//       {/* ── Review list ─────────────────────────────────────────── */}
//       <ReviewList reviews={reviews} loading={loading} />

//       {/* ── Load more ───────────────────────────────────────────── */}
//       {hasMore && (
//         <button
//           onClick={() => loadReviews(page + 1)}
//           className="mt-4 text-sm font-medium text-black underline"
//         >
//           {t("Load more reviews")}
//         </button>
//       )}
//     </div>
//   );
// }
