import { useState, useEffect } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  getProducts,
  addProductsToDiscount,
  getDiscountById,
} from "../../services/services_admin/inventoryService";

const AssignProductModal = ({ isOpen, onClose, discount, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [assignedProductIds, setAssignedProductIds] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        page: currentPage,
        limit,
        search: searchTerm,
        is_active: true, // Only active products
      });

      if (response.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch discount detail to get already assigned products
  const fetchAssignedProducts = async () => {
    try {
      const response = await getDiscountById(discount.id);
      if (response.success) {
        const assignedIds = (response.data.products || []).map((p) => p.id);
        setAssignedProductIds(assignedIds);
      }
    } catch (err) {
      console.error("Error fetching assigned products:", err);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && discount) {
      fetchProducts();
      fetchAssignedProducts();
    }
  }, [isOpen, discount, currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select all visible products (not already assigned)
  const selectAllVisible = () => {
    const availableProducts = products.filter(
      (p) => !assignedProductIds.includes(p.id)
    );
    const availableIds = availableProducts.map((p) => p.id);
    setSelectedProducts((prev) => {
      // Toggle: if all are selected, deselect; otherwise select all
      const allSelected = availableIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !availableIds.includes(id));
      } else {
        return [...new Set([...prev, ...availableIds])];
      }
    });
  };

  // Assign products to discount
  const handleAssign = async () => {
    if (selectedProducts.length === 0) {
      alert("Pilih minimal 1 produk untuk ditambahkan ke diskon");
      return;
    }

    try {
      setSubmitting(true);
      const response = await addProductsToDiscount(discount.id, selectedProducts);

      if (response.success) {
        alert(
          `✅ Berhasil menambahkan ${selectedProducts.length} produk ke diskon!`
        );
        onSuccess();
      }
    } catch (err) {
      console.error("Error assigning products:", err);
      alert(err.message || "Gagal menambahkan produk ke diskon");
    } finally {
      setSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Check if product is already assigned
  const isAlreadyAssigned = (productId) => {
    return assignedProductIds.includes(productId);
  };

  // Check if product is selected
  const isSelected = (productId) => {
    return selectedProducts.includes(productId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal - Diperbesar ke max-w-5xl */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-green-600 px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Pilih Produk</h3>
              <p className="text-sm text-green-100 mt-1">
                📌 {discount?.discount_name}
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Search & Selection Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
              {/* Search */}
              <div className="flex-1 w-full relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>

              {/* Selection count */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 font-semibold">
                  {selectedProducts.length} produk dipilih
                </div>

                {/* Select All */}
                <button
                  onClick={selectAllVisible}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium border border-green-300"
                >
                  Pilih Semua Halaman Ini
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
                  <p className="text-sm mt-2">Coba ubah kata kunci pencarian</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {products.map((product) => {
                    const alreadyAssigned = isAlreadyAssigned(product.id);
                    const selected = isSelected(product.id);

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-4 border-b border-gray-200 transition-all ${
                          alreadyAssigned ? "bg-gray-100 opacity-60" : ""
                        } ${
                          selected
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleProductSelection(product.id)}
                            disabled={alreadyAssigned}
                            className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 cursor-pointer"
                          />

                          {/* Product Image Placeholder */}
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow">
                            <span className="text-gray-500 text-xs font-bold">
                              IMG
                            </span>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-base mb-1">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <span className="bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                💰 {formatPrice(product.selling_price)}
                              </span>
                              <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                📦 Stok: {product.total_stock || 0} {product.unit || "unit"}
                              </span>
                              {product.category_name && (
                                <span className="bg-purple-50 px-2 py-1 rounded border border-purple-200 text-purple-700">
                                  🏷️ {product.category_name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {alreadyAssigned && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                              <CheckIcon className="w-5 h-5" />
                              Sudah Terdaftar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="mt-5 flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-700 font-medium">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-medium transition-all"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-medium transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {selectedProducts.length > 0 && (
                <span className="font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  ✅ {selectedProducts.length} produk siap ditambahkan
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={submitting || selectedProducts.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[180px] justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="w-5 h-5" />
                    Tambahkan {selectedProducts.length > 0 ? selectedProducts.length : ""}{" "}
                    Produk
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProductModal;
