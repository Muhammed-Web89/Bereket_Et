import React from 'react';
import { Product } from '../types';
import { CheckCircle2, XCircle, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../data';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  isAdminMode: boolean;
  onToggleStock?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onUpdateQuantity,
  isAdminMode,
  onToggleStock
}) => {
  const handleIncrease = () => {
    onUpdateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrease = () => {
    if (quantityInCart > 0) {
      onUpdateQuantity(product.id, quantityInCart - 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
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
            className="absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-sm bg-white border border-gray-200 text-gray-700"
          >
            {cat ? `${cat.emoji} ${cat.name}` : product.category}
          </span>
        );
      })()}

      {/* Stock Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {product.inStock ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-600 shadow-sm">
            <CheckCircle2 size={12} className="text-emerald-500" />
            В наличии
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-1 text-xs font-medium text-rose-600 shadow-sm">
            <XCircle size={12} className="text-rose-500" />
            Нет в наличии
          </span>
        )}
      </div>

      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {!product.inStock && !isAdminMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-gray-800 shadow-lg">
              Временно нет
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-sans text-base font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Цена</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{product.price}</span>
              <span className="text-xs font-semibold text-gray-500">TL / {product.unit}</span>
            </div>
          </div>

          {/* Admin Control Actions */}
          {isAdminMode ? (
            <div className="flex flex-col gap-1.5 w-1/2">
              <button
                id={`btn-toggle-stock-${product.id}`}
                onClick={() => onToggleStock?.(product.id)}
                className={`w-full rounded-xl py-2 text-xs font-bold transition-all text-center border cursor-pointer ${
                  product.inStock
                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {product.inStock ? 'Нет на складе' : 'В наличии'}
              </button>
            </div>
          ) : (
            /* User Add-to-Cart Controls */
            <div className="flex items-center">
              {product.inStock ? (
                quantityInCart > 0 ? (
                  <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl p-1 shadow-sm">
                    <button
                      id={`btn-decrease-${product.id}`}
                      onClick={handleDecrease}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-sky-100 text-sky-600 hover:bg-sky-100 active:scale-95 transition-all cursor-pointer"
                      title="Уменьшить"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-sky-700 text-sm">
                      {quantityInCart}
                    </span>
                    <button
                      id={`btn-increase-${product.id}`}
                      onClick={handleIncrease}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all cursor-pointer"
                      title="Увеличить"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    id={`btn-add-to-cart-${product.id}`}
                    onClick={handleIncrease}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={13} />
                    Выбрать
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="rounded-xl bg-gray-100 text-gray-400 px-3.5 py-2 text-xs font-bold cursor-not-allowed"
                >
                  Нет в наличии
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
