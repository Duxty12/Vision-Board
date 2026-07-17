'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface SearchFilterBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  filters?: React.ReactNode;
}

export function SearchFilterBar({
  placeholder = 'Search…',
  onSearch,
  filters,
}: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <div id="search-filter-bar" className="w-full space-y-3">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="
              w-full pl-9 pr-10 py-2.5 rounded-xl text-sm font-sans
              bg-white/80 border border-stone-200
              placeholder:text-stone-400 text-stone-800
              focus:outline-none focus:ring-2 focus:ring-cork-400/60 focus:border-transparent
              transition-all duration-200 shadow-sm
            "
          />
          {query && (
            <button
              id="search-clear"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          id="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium font-sans shrink-0
            border transition-all duration-200
            ${showFilters
              ? 'bg-cork-50 border-cork-300 text-cork-700'
              : 'bg-white/80 border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800'
            }
          `}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter panel (slot for page-specific filters) */}
      {showFilters && (
        <div
          id="filter-panel"
          className="glass-card p-4 rounded-xl animate-slide-up"
        >
          {filters ?? (
            <p className="text-sm text-stone-400 font-sans text-center py-2">
              No filters available for this view.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
