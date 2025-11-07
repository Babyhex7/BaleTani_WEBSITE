import { useState, useEffect } from 'react';

/**
 * Custom hook untuk debouncing value
 * Menunda update value hingga user berhenti mengetik
 * 
 * @param {any} value - Value yang akan di-debounce
 * @param {number} delay - Delay dalam milliseconds (default: 500ms)
 * @returns {any} - Debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 500);
 * 
 * useEffect(() => {
 *   // Fetch hanya dipanggil 500ms setelah user berhenti ketik
 *   fetchData(debouncedSearch);
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout untuk update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timeout jika value berubah sebelum delay selesai
    // Ini mencegah multiple API calls saat user masih mengetik
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
