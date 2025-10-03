import { Star, MessageCircle, ShoppingCart } from 'lucide-react';
import Button from './Button';

const ProductCard = ({ 
  product, 
  onWhatsAppOrder, 
  onAddToCart, 
  formatPrice,
  className = '' 
}) => {
  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200 ${className}`}>
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
          {product.category}
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500">/{product.unit}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Stok: {product.stock}</span>
          </div>
        
        </div>
        
        <div className="space-y-2 pt-2">
          <Button 
            size="md"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onWhatsAppOrder(product.name, product.price, product.unit)}
          >
            <MessageCircle className="mr-2" size={16} />
            Pesan WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="md"
            className="w-full border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-600"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="mr-2" size={16} />
            Tambah ke Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;