import { ShoppingCart, Eye, Tag, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/store_customer/useCartStore';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const displayPrice = product.price;
  const isOutOfStock = product.stock === 0;

  // Generate random image from Unsplash based on product category
  const getProductImage = () => {
    if (product.image && !product.image.includes('placeholder')) {
      return product.image;
    }
    
    const category = product.category?.toLowerCase() || 'vegetables';
    const queries = {
      sayuran: 'fresh-vegetables',
      buah: 'fresh-fruits',
      bumbu: 'spices-herbs',
      daging: 'fresh-meat',
      seafood: 'fresh-seafood',
    };
    
    const query = queries[category] || 'fresh-produce';
    return `https://source.unsplash.com/400x300/?${query}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product, 1);
      toast.success(`${product.name} ditambahkan ke keranjang!`);
    }
  };

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-green-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getProductImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Tag size={12} />
                -{discountPercent}%
              </span>
            )}
            {product.category && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                {product.category}
              </span>
            )}
          </div>

          {/* Stock Badge - Only show if out of stock */}
          {isOutOfStock && (
            <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium">
              Habis
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="bg-white text-green-600 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            Rp {displayPrice.toLocaleString('id-ID')}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Unit */}
        {product.unit && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Package size={14} />
            <span>Per {product.unit}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={18} />
          {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;