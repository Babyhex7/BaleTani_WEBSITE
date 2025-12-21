/**
 * ============================================
 * SEARCH BAR COMPONENT - REUSABLE
 * ============================================
 * Komponen search bar yang bisa dipakai di berbagai halaman
 * Style: Tokopedia-inspired dengan green background
 * 
 * FEATURES:
 * - Search input dengan icon
 * - Clear button (X) untuk reset
 * - Placeholder customizable
 * - Auto-submit on Enter
 * - Responsive design
 * 
 * USE CASES:
 * - ProductPage (Katalog Produk)
 * - PromoPage (Produk Promo)
 * - SearchPage (Halaman Pencarian)
 * - CategoryPage (Kategori Produk)
 * 
 * @module SearchBar
 * @requires lucide-react
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {String} props.value - Current search value (controlled)
 * @param {Function} props.onChange - Handler saat input berubah
 * @param {Function} props.onClear - Handler saat clear button diklik
 * @param {Function} [props.onSubmit] - Handler saat form submit (Enter)
 * @param {String} [props.placeholder='Cari produk...'] - Placeholder text
 * @param {String} [props.className=''] - Additional CSS classes
 * 
 * @example
 * // Basic usage
 * <SearchBar 
 *   value={searchInput}
 *   onChange={(e) => setSearchInput(e.target.value)}
 *   onClear={() => setSearchInput('')}
 * />
 * 
 * @example
 * // With custom placeholder and submit
 * <SearchBar 
 *   value={searchInput}
 *   onChange={(e) => setSearchInput(e.target.value)}
 *   onClear={() => setSearchInput('')}
 *   onSubmit={(e) => { e.preventDefault(); doSearch(); }}
 *   placeholder="Cari promo menarik..."
 * />
 */
const SearchBar = ({ 
  value, 
  onChange, 
  onClear,
  onSubmit,
  placeholder = 'Cari produk...',
  className = '',
  'data-cy': dataCy
}) => {
  /**
   * Handle form submit
   * Default behavior: prevent refresh
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Search Icon - Left side */}
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
        size={20} 
        aria-hidden="true"
      />
      
      {/* Search Input */}
      <input
        data-cy={dataCy}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full 
          pl-12 
          pr-12 
          py-3 
          rounded-full 
          text-gray-900 
          placeholder-gray-400 
          bg-white
          focus:outline-none 
          focus:ring-2 
          focus:ring-green-300 
          shadow-md 
          transition-all
          hover:shadow-lg
        "
        aria-label={placeholder}
      />
      
      {/* Clear Button - Right side */}
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="
            absolute 
            right-4 
            top-1/2 
            -translate-y-1/2 
            text-gray-400 
            hover:text-gray-600 
            transition-colors
            p-1
            rounded-full
            hover:bg-gray-100
          "
          aria-label="Hapus pencarian"
        >
          <X size={20} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
