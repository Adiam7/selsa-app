/**
 * Search Input Component with Autocomplete
 * Real-time search suggestions and results
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import styles from '../styles/page.module.css';

export interface SearchInputProps {
  placeholder?: string;
  onResultClick?: (resultId: string, type: string) => void;
  showPopular?: boolean;
  maxSuggestions?: number;
}

/**
 * Search Input with Autocomplete
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search products, categories...',
  onResultClick,
  showPopular = true,
  maxSuggestions = 8,
}) => {
  const {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    search,
    getSuggestions,
    clearSearch,
    getPopularSearches,
  } = useSearch();

  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = async (value: string) => {
    setQuery(value);
    setFocusedIndex(-1);

    if (value.trim()) {
      await getSuggestions(value);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // Handle search submission
  const handleSearch = async (value: string = query) => {
    if (value.trim()) {
      await search(value);
      setShowDropdown(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    await search(suggestion);
    setShowDropdown(false);
  };

  // Handle result click
  const handleResultClick = (resultId: string, type: string) => {
    onResultClick?.(resultId, type);
    setShowDropdown(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (suggestions.length || getPopularSearches().length) + results.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % (totalItems + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + totalItems + 1) % (totalItems + 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          const item = suggestions[focusedIndex] || results[focusedIndex];
          if (item && 'text' in item) {
            handleSuggestionClick(item.text);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displaySuggestions = query.trim()
    ? suggestions.slice(0, maxSuggestions)
    : showPopular
      ? getPopularSearches().slice(0, maxSuggestions)
      : [];

  const displayResults = results.slice(0, 5);

  return (
    <div className={styles.searchInputContainer}>
      <div className={styles.searchInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowDropdown(true)}
          placeholder={placeholder}
          className={styles.searchInput}
          aria-label="Search products and categories"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        <div className={styles.searchInputActions}>
          {isLoading && <div className={styles.searchSpinner} />}
          {query && (
            <button
              className={styles.searchClearBtn}
              onClick={clearSearch}
              aria-label="Clear search"
            >{t('✕')}</button>
          )}
          <button
            className={styles.searchBtn}
            onClick={() => handleSearch()}
            aria-label="Search"
          >{t('🔍')}</button>
        </div>
      </div>
      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={styles.searchDropdown}
          role="listbox"
        >
          {/* Suggestions Section */}
          {displaySuggestions.length > 0 && (
            <div className={styles.searchSection}>
              <div className={styles.searchSectionTitle}>
                {query.trim() ? 'Suggestions' : 'Popular Searches'}
              </div>
              <div className={styles.searchSuggestions}>
                {displaySuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={`${styles.searchSuggestionItem} ${
                      focusedIndex === index
                        ? styles.searchSuggestionItemFocused
                        : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    role="option"
                    aria-selected={focusedIndex === index}
                  >
                    <span className={styles.searchSuggestionIcon}>
                      {suggestion.type === 'recent' ? '🕐' : '⭐'}
                    </span>
                    <span className={styles.searchSuggestionText}>
                      {suggestion.text}
                    </span>
                    {suggestion.count && (
                      <span className={styles.searchSuggestionCount}>
                        {suggestion.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          {query.trim() && displayResults.length > 0 && (
            <div className={styles.searchSection}>
              <div className={styles.searchSectionTitle}>{t('Results')}</div>
              <div className={styles.searchResults}>
                {displayResults.map((result, index) => (
                  <button
                    key={result.id}
                    className={`${styles.searchResultItem} ${
                      focusedIndex === suggestions.length + index
                        ? styles.searchResultItemFocused
                        : ''
                    }`}
                    onClick={() =>
                      handleResultClick(result.id, result.type)
                    }
                    role="option"
                    aria-selected={
                      focusedIndex === suggestions.length + index
                    }
                  >
                    {result.type === 'product' ? (
                      <>
                        <div className={styles.searchResultImage}>
                          {result.image && (
                            <img src={result.image} alt={result.name_display || result.name} />
                          )}
                        </div>
                        <div className={styles.searchResultContent}>
                          <div className={styles.searchResultName}>
                            {result.name_display || result.name}
                          </div>
                          <div className={styles.searchResultMeta}>
                            {result.category && (
                              <span>{result.category}</span>
                            )}
                            {result.rating && (
                              <span>{t('⭐')}{result.rating}</span>
                            )}
                          </div>
                        </div>
                        {result.price && (
                          <div className={styles.searchResultPrice}>{t('$')}{result.price.toFixed(2)}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <span className={styles.searchResultIcon}>{t('📁')}</span>
                        <div className={styles.searchResultContent}>
                          <div className={styles.searchResultName}>
                            {result.name_display || result.name}
                          </div>
                          <div className={styles.searchResultMeta}>{t('Category')}</div>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query.trim() &&
            displayResults.length === 0 &&
            displaySuggestions.length === 0 && (
              <div className={styles.searchEmpty}>
                <div className={styles.searchEmptyIcon}>{t('🔍')}</div>
                <p className={styles.searchEmptyText}>{t('No results for "')}{query}{t('"')}</p>
                <p className={styles.searchEmptyHint}>{t('Try different keywords or browse categories')}</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
