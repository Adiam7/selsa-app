"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

interface FavoriteSelectorProps {
  productId: string;
  isFavorited?: boolean;
  toggleFavorite?: () => void;
  size?: number;
  contentType?: string;
}

/**
 * Fallback component that uses only local state
 * Used when QueryClient is not available
 */
function FavoriteSelectorFallback({
  productId,
  isFavorited: initialFavorited = false,
  toggleFavorite: externalToggle,
  size = 28,
}: Omit<FavoriteSelectorProps, "contentType">) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    console.log(
      "[FavoriteSelectorFallback] Component mounted/updated, initialFavorited:",
      initialFavorited,
      "isFavorited:",
      isFavorited
    );
  }, [initialFavorited, isFavorited]);

  // Sync parent's isFavorited prop changes
  useEffect(() => {
    console.log("[FavoriteSelectorFallback] Parent isFavorited changed to:", initialFavorited);
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("[FavoriteSelectorFallback] Click detected, externalToggle exists:", !!externalToggle);
    e.preventDefault();
    e.stopPropagation();

    if (externalToggle) {
      console.log("[FavoriteSelectorFallback] Calling externalToggle");
      externalToggle();
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

    setIsToggling(true);
    setIsFavorited((prev) => !prev);
    setTimeout(() => setIsToggling(false), 300);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorited}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      disabled={isToggling}
      className={`favorite-btn transition-all duration-200 ${
        isFavorited ? "favorited" : "not-favorited"
      } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "none",
        borderRadius: "50%",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isToggling ? "not-allowed" : "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isToggling) {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <Heart
        size={size}
        fill={isFavorited ? "#ef4444" : "none"}
        stroke={isFavorited ? "#ef4444" : "#000000"}
        strokeWidth={2}
        className={isToggling ? "animate-pulse" : ""}
      />
    </button>
  );
}

/**
 * Internal component that uses React Query hooks
 * This is only loaded when QueryClient is available
 */
function FavoriteSelectorWithQuery({
  productId,
  isFavorited: initialFavorited,
  toggleFavorite: externalToggle,
  size = 28,
  contentType = "products.product",
}: FavoriteSelectorProps) {
  const { useFavorite } = require("@/features/favourites/hooks/useFavorite");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { isFavorited, isToggling, toggle } = useFavorite({
    contentType,
    objectId: productId,
    enabled: isAuthenticated,
  });

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (externalToggle) {
      externalToggle();
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

    try {
      toggle();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update favorite";
      toast.error(errorMsg);
    }
  };

  const isCurrentlyFavorited =
    initialFavorited !== undefined ? initialFavorited : isFavorited;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isCurrentlyFavorited}
      aria-label={
        isCurrentlyFavorited
          ? "Remove from favorites"
          : "Add to favorites"
      }
      disabled={isToggling}
      className={`favorite-btn transition-all duration-200 ${
        isCurrentlyFavorited ? "favorited" : "not-favorited"
      } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "none",
        borderRadius: "50%",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isToggling ? "not-allowed" : "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isToggling) {
          (e.currentTarget as HTMLButtonElement).style.transform =
            "scale(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <Heart
        size={size}
        fill={isCurrentlyFavorited ? "#ef4444" : "none"}
        stroke={isCurrentlyFavorited ? "#ef4444" : "#000000"}
        strokeWidth={2}
        className={isToggling ? "animate-pulse" : ""}
      />
    </button>
  );
}

/**
 * Main FavoriteSelector component
 * Safely uses QueryClient if available, falls back to local state otherwise
 */
export const FavoriteSelector: React.FC<FavoriteSelectorProps> = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // During SSR, use fallback
    return <FavoriteSelectorFallback {...props} />;
  }

  return (
    <Suspense fallback={<FavoriteSelectorFallback {...props} />}>
      <FavoriteSelectorWithQuery {...props} />
    </Suspense>
  );
};
