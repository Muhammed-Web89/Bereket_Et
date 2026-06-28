import React, { useState } from 'react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { CheckCircle2, XCircle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';
import { ImageLightbox } from './ImageLightbox';

interface ProductCardProps {
  product: Product;
  isAdminMode: boolean;
  onToggleStock?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdminMode,
  onToggleStock
}) => {
  // Directly subscribe to this item's quantity in the Zustand store
  const quantityInCart = useCartStore(
    (state) => state.cart.find((item) => item.product.id === product.id)?.quantity || 0
  );
  
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const addToCart = useCartStore((state) => state.addToCart);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleIncrease = () => {
    if (quantityInCart > 0) {
      updateQuantity(product.id, quantityInCart + 1);
    } else {
      addToCart(product);
    }
  };

  const handleDecrease = () => {
    if (quantityInCart > 0) {
      updateQuantity(product.id, quantityInCart - 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
        quantityInCart > 0 ? 'border-sky-500 shadow-md ring-1 ring-sky-100' : 'border-gray-100 hover:shadow-md'
      } ${!product.inStock && !isAdminMode ? 'opacity-85' : ''}`}
    >
      {/* Category Tag Badge */}
      {(() => {
        const cat = CATEGORIES.find(c => c.id === product.category);
        return (
          <span
            id={`category-badge-${product.id}`}
            className="absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase shadow-xs bg-white/95 border border-gray-150 text-gray-700"
          >
            {cat ? `${cat.emoji} ${cat.name.split(' ')[0]}` : product.category}
          </span>
        );
      })()}

      {/* Stock Status Badge */}
      <div className="absolute top-2 right-2 z-10">
        {product.inStock ? (
          <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600 shadow-xs">
            🟢 В наличии
          </span>
        ) : (
          <span className="flex items-center gap-0.5 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600 shadow-xs">
            🔴 Нет
          </span>
        )}
      </div>

      {/* Product Image Panel */}
      <div className="relative aspect-square sm:aspect-video w-full overflow-hidden bg-gray-50 border-b border-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
            referrerPolicy="no-referrer"
            onClick={() => setIsLightboxOpen(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <ShoppingCart size={24} />
          </div>
        )}
        {!product.inStock && !isAdminMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[0.5px]">
            <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-black text-gray-800 shadow-sm uppercase tracking-wider">
              Распродано
            </span>
          </div>
        )}
      </div>

      {/* Full screen immersive Lightbox for high detail view & touch zoom */}
      {isLightboxOpen && product.image && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={product.image}
          alt={product.name}
        />
      )}

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 text-left">
        <h3 className="font-sans text-xs sm:text-sm font-bold text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-1 text-[10px] sm:text-xs text-gray-400 line-clamp-2 h-7 sm:h-8 leading-normal">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-2.5 flex items-end justify-between">
          <div className="min-w-0">
            <span className="text-[9px] text-gray-400 font-bold block">Цена</span>
            <div className="flex items-baseline gap-0.5 truncate">
              <span className="text-sm sm:text-base font-black text-gray-900">{product.price}</span>
              <span className="text-[10px] font-bold text-gray-500">TL/{product.unit}</span>
            </div>
          </div>

          {/* Admin Control Actions */}
          {isAdminMode ? (
            <div className="flex flex-col gap-1 w-1/2">
              <button
                id={`btn-toggle-stock-${product.id}`}
                onClick={() => onToggleStock?.(product.id)}
                className={`w-full rounded-xl py-1.5 text-[10px] font-extrabold transition-all text-center border cursor-pointer ${
                  product.inStock
                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {product.inStock ? 'Распродано' : 'В наличии'}
              </button>
            </div>
          ) : (
            /* User Add-to-Cart Controls */
            <div className="flex items-center">
              {product.inStock ? (
                quantityInCart > 0 ? (
                  <div className="flex items-center gap-1 bg-sky-50 border border-sky-100 rounded-xl p-0.5 shadow-xs">
                    <button
                      id={`btn-decrease-${product.id}`}
                      onClick={handleDecrease}
                      className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-white border border-sky-100 text-sky-600 hover:bg-sky-100 active:scale-95 transition-all cursor-pointer font-extrabold"
                      title="Уменьшить"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-mono font-black text-sky-700 text-xs">
                      {quantityInCart}
                    </span>
                    <button
                      id={`btn-increase-${product.id}`}
                      onClick={handleIncrease}
                      className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all cursor-pointer font-extrabold"
                      title="Увеличить"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    id={`btn-add-to-cart-${product.id}`}
                    onClick={handleIncrease}
                    className="flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1.5 text-[10px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Добавить
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="rounded-lg bg-gray-100 text-gray-400 px-2 py-1.5 text-[10px] sm:text-xs font-bold cursor-not-allowed whitespace-nowrap"
                >
                  Распродано
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
