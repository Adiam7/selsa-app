"use client";

import React from "react";

interface StarRatingProps {
  /** Current rating value (can be fractional for display) */
  value: number;
  /** Max stars */
  max?: number;
  /** Size in pixels */
  size?: number;
  /** If provided, clicking a star calls this with the 1-based index */
  onChange?: (rating: number) => void;
  /** Show numeric label beside stars */
  showValue?: boolean;
}

/**
 * Renders filled / half / empty stars.
 * Interactive when `onChange` is supplied.
 */
export function StarRating({
  value,
  max = 5,
  size = 20,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => {
    const idx = i + 1;
    const fill =
      value >= idx ? "full" : value >= idx - 0.5 ? "half" : "empty";
    return (
      <span
        key={idx}
        role={onChange ? "button" : undefined}
        tabIndex={onChange ? 0 : undefined}
        aria-label={onChange ? `Rate ${idx} star${idx > 1 ? "s" : ""}` : undefined}
        onClick={() => onChange?.(idx)}
        onKeyDown={(e) => {
          if (onChange && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onChange(idx);
          }
        }}
        className={onChange ? "cursor-pointer" : ""}
        style={{ fontSize: size, lineHeight: 1 }}
      >
        {fill === "full" && (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
        {fill === "half" && (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            stroke="#f59e0b"
            strokeWidth="1"
          >
            <defs>
              <linearGradient id={`half-${idx}`}>
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={`url(#half-${idx})`}
            />
          </svg>
        )}
        {fill === "empty" && (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
      </span>
    );
  });

  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
