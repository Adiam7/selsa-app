"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAutocompleteSuggestions, AutocompleteResult } from "@/lib/api/advanced";
import styles from "./SearchAutocomplete.module.css";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const LISTBOX_ID = "search-autocomplete-listbox";

const SearchAutocomplete = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getAutocompleteSuggestions(debouncedQuery);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        router.push(`/catalog/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const handleSelect = useCallback(
    (suggestion: AutocompleteResult) => {
      setIsOpen(false);
      setQuery("");
      if (suggestion.type === "product") {
        router.push(`/product/${suggestion.slug || suggestion.id}`);
      } else {
        router.push(`/category/${suggestion.slug}`);
      }
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <form
        className="flex items-center justify-between gap-4 bg-gray-100 p-2 rounded-md flex-1"
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          name="name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="flex-1 bg-transparent outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen ? "true" : "false"}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={LISTBOX_ID}
          aria-label="Search products"
        />
        {isLoading ? (
          <div className={styles.loadingSpinner} role="status" aria-label="Loading" />
        ) : (
          <button type="submit" className="cursor-pointer" title="Search">
            <Image src="/search.png" alt="Search" width={16} height={16} />
          </button>
        )}
      </form>

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Search suggestions"
          className={styles.dropdown}
        >
          {suggestions.map((item, index) => (
            <li
              key={`${item.type}-${item.id}`}
              role="option"
              aria-selected={index === selectedIndex ? "true" : "false"}
              onClick={() => handleSelect(item)}
              className={`${styles.suggestionItem} ${index === selectedIndex ? styles.suggestionItemSelected : ""}`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Thumbnail */}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  className={styles.thumbnail}
                />
              ) : (
                <span className={styles.placeholderIcon}>
                  {item.type === "product" ? "\ud83d\udecd\ufe0f" : "\ud83d\udcc2"}
                </span>
              )}
              {/* Text */}
              <div className={styles.textContent}>
                <div className={styles.suggestionName}>{item.name}</div>
                <div className={styles.suggestionType}>
                  {item.type === "product" ? "Product" : "Category"}
                </div>
              </div>
              {/* Price */}
              {item.price != null && (
                <span className={styles.suggestionPrice}>
                  ${item.price.toFixed(2)}
                </span>
              )}
            </li>
          ))}
          {/* Search all link */}
          <li
            role="option"
            aria-selected="false"
            onClick={handleSubmit as any}
            className={styles.searchAllLink}
          >
            Search all results for &ldquo;{query}&rdquo;
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchAutocomplete;
