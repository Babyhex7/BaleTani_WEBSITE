import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Pagination (Customer UI)
 * - Responsive, modern look
 * - Works with currentPage, totalPages, totalItems, itemsPerPage
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  className = '',
  showInfo = true,
  compact = false,
  alwaysShow = false,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = () => {
    const pages = [];
    const maxVisible = compact ? 3 : 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (!alwaysShow && totalPages <= 1) return null;

  return (
    <div data-cy="pagination" className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 ${className}`}>
      {showInfo && !compact && (
        <div className="hidden sm:block text-sm text-gray-600">
          Menampilkan <span className="font-semibold text-gray-900">{startItem}</span> -{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> dari{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> produk
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 shadow-sm hover:shadow-md'
          } flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-200`}
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {pageNumbers().map((p, idx) =>
            p === '...'
              ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">
                    ...
                  </span>
                )
              : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`${
                      p === currentPage
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                    } min-w-[40px] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-200`}
                  >
                    {p}
                  </button>
                )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 shadow-sm hover:shadow-md'
          } flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-200`}
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <span className="sm:hidden">Next</span>
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      </div>

      {showInfo && (
        <div className="sm:hidden text-xs text-gray-600 text-center">
          Hal {currentPage} dari {totalPages} • {totalItems} produk
        </div>
      )}
    </div>
  );
};

export default Pagination;
