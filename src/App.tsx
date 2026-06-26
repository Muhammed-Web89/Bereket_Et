import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './data';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { Logo } from './components/Logo';
import { 
  Search, 
  ShoppingCart, 
  Filter, 
  ChevronRight,
  X,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from './store/cartStore';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Zustand Store values
  const { 
    setCartOpen, 
    getTotalCount 
  } = useCartStore();

  const totalCartItemsCount = getTotalCount();

  // Initialize Telegram WebApp settings
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
        if (tg.setHeaderColor) {
          tg.setHeaderColor('bg_color');
        }
      }
    } catch (e) {
      console.error('Telegram WebApp SDK initialization warning:', e);
    }
  }, []);

  // Core product loading API
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          try {
            localStorage.setItem('bereket_products', JSON.stringify(data));
          } catch (err) {
            console.error(err);
          }
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch from server API', err);
    }

    // Fallback locally
    try {
      const stored = localStorage.getItem('bereket_products');
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('bereket_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (e) {
      console.error('LocalStorage not available', e);
      setProducts(INITIAL_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filters calculation
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || p.category === activeTab;
    const matchesStock = !hideOutOfStock || p.inStock;
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none antialiased text-gray-800">
      
      {/* Top Navigation Bar / Branding Header */}
      <header className="sticky top-0 z-30 bg-[#24A1DE] text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Hamburger Menu Toggle Button on Mobile */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 hover:bg-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Kategoriler"
              aria-label="Kategorileri Aç"
            >
              <Menu size={22} className="text-white" />
            </button>

            <div className="flex items-center gap-2">
              <Logo className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 bg-white p-0.5 rounded-xl shadow-sm" showText={false} />
              <div className="flex flex-col text-left font-sans uppercase leading-none select-none">
                <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-wider text-white">
                  BEREKET ET
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-wider text-amber-200 mt-0.5">
                  DÜNYASI
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center gap-2">
            
            {/* Shopping Cart Header Panel button */}
            <button
              id="btn-header-cart-toggle"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>Sepet</span>
              {totalCartItemsCount > 0 && (
                <span className="bg-white text-[#24A1DE] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {totalCartItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Side Slide Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Dynamic Drawer Sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 z-50 h-full w-full max-w-xs bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Logo className="h-8 w-8" showText={false} />
                  <span className="text-xs font-black tracking-wider text-gray-800 uppercase">KATEGORİLER</span>
                </div>
                <button
                  id="btn-close-mobile-menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-150 hover:text-gray-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Categories List inside menu */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3.5 mb-2 block">
                  Mağaza Bölümleri
                </p>

                {/* Show All option */}
                <button
                  id="mobile-menu-tab-all"
                  onClick={() => {
                    setActiveTab('all');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-sky-50 text-sky-800 border-l-4 border-[#24A1DE] font-bold'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔍</span>
                    <span>Tüm Ürünler</span>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                    {products.length}
                  </span>
                </button>

                {/* Dynamic Category List */}
                {CATEGORIES.map((cat) => {
                  const catCount = products.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      id={`mobile-menu-tab-${cat.id}`}
                      onClick={() => {
                        setActiveTab(cat.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === cat.id
                          ? 'bg-sky-50 text-sky-800 border-l-4 border-[#24A1DE] font-bold'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 space-y-1">
                <p className="font-extrabold text-gray-700 text-[11px] tracking-wide">BEREKET ET DÜNYASI</p>
                <p className="text-gray-400">Taze helal et ve şarküteri ürünleri.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">

        {/* Catalog Exploration Section */}
        <div className="space-y-4">
          
          {/* Filters, Categories and Searching Section Header */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Category Filter Tabs - Scrollable Container */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 max-w-full scrollbar-none no-scrollbar flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
              <button
                id="tab-all"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-[#24A1DE] text-white shadow-sm font-semibold'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-800'
                }`}
              >
                🔍 Hepsi ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`tab-${cat.id}`}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === cat.id
                      ? 'bg-[#24A1DE] text-white shadow-sm font-semibold'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* In-stock toggle and Search Box info */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 xl:justify-end">
              
              {/* Hide out of stock toggle button */}
              <button
                id="btn-toggle-filter-stock"
                onClick={() => setHideOutOfStock(!hideOutOfStock)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  hideOutOfStock
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter size={13} />
                Sadece Stokta Olanlar
              </button>

              {/* Dynamic search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  id="catalog-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full sm:w-64 rounded-xl border border-gray-250 bg-white pl-9 pr-4 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-sky-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Catalog Listing Grid - Exactly 2 Columns on Mobile to prevent full screen takeover */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            <AnimatePresence>
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdminMode={false}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty Search / Filter state */}
          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 py-16 text-center shadow-sm">
              <span className="text-4xl text-gray-300 block mb-2">🔎</span>
              <p className="font-bold text-gray-700">Ürün bulunamadı</p>
              <p className="text-xs text-gray-400 mt-1">
                Lütfen arama kelimenizi veya seçtiğiniz kategoriyi değiştirip deneyin.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* Footer Branding Area */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12 text-center text-xs text-gray-400 font-medium" id="page-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex justify-center">
            <Logo className="h-24 w-24 animate-fade-in" showText={true} />
          </div>
          <p className="flex items-center justify-center gap-1.5 font-extrabold text-gray-800 text-sm">
            BEREKET ET DÜNYASI
          </p>
          <p className="text-[10px] leading-relaxed text-gray-400 font-medium max-w-sm mx-auto">
            Официальный магазин «Bereket Et Dünyası» — taze helal et, kaliteli şarküteri ve çiftlik ürünleri. Her hakkı saklıdır © 2026.
          </p>
        </div>
      </footer>

      {/* Persistent Sticky Cart Action Bar for Mobile Users */}
      {totalCartItemsCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
          <button
            id="btn-floating-cart-bar"
            onClick={() => setCartOpen(true)}
            className="w-full bg-[#24A1DE] text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-between animate-bounce"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart size={16} />
              </div>
              <span className="text-xs">Sepette {totalCartItemsCount} ürün var</span>
            </div>
            
            <span className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex items-center gap-0.5">
              Sepeti Aç
              <ChevronRight size={12} />
            </span>
          </button>
        </div>
      )}

      {/* Checkout Sidebar Cart Drawer */}
      <CartDrawer />

    </div>
  );
}
