import React, { useState, useEffect } from 'react';
import { Product, CartItem } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './data';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { Logo } from './components/Logo';
import { 
  Store, 
  Search, 
  ShoppingCart, 
  Shield, 
  ShieldAlert, 
  LogOut, 
  Filter, 
  Sparkles, 
  MessageSquare,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
  Lock,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  
  // Custom states for admin flow
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminOverlayOpen, setIsAdminOverlayOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize Telegram WebApp settings to prevent scrolling-collapse issues and open full screen
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        // Inform Telegram that the app is ready and fully loaded
        tg.ready();
        
        // Expand the mini app to its maximum height immediately on launch
        tg.expand();
        
        // Disable swipe down to dismiss/minimize the Web App (requires Bot API 7.7+)
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }

        // Enable header color customization, optionally matching theme
        if (tg.setHeaderColor) {
          tg.setHeaderColor('bg_color');
        }
      }
    } catch (e) {
      console.error('Telegram WebApp SDK initialization warning:', e);
    }
  }, []);

  // Restore admin mode from sessionStorage if a token already exists
  useEffect(() => {
    const token = sessionStorage.getItem('bereket_admin_token');
    if (token) {
      fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Invalid token');
      })
      .then(data => {
        if (data.valid) {
          setIsAdminMode(true);
        } else {
          sessionStorage.removeItem('bereket_admin_token');
        }
      })
      .catch(() => {
        // Safe to ignore network problems during check
        sessionStorage.removeItem('bereket_admin_token');
      });
    }
  }, []);

  // Fetch products from server on mount
  useEffect(() => {
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

      // Fallback to localStorage or default seed catalog
      try {
        const stored = localStorage.getItem('bereket_products');
        if (stored) {
          setProducts(JSON.parse(stored));
        } else {
          setProducts(INITIAL_PRODUCTS);
          localStorage.setItem('bereket_products', JSON.stringify(INITIAL_PRODUCTS));
        }
      } catch (e) {
        console.error('LocalStorage is not available', e);
        setProducts(INITIAL_PRODUCTS);
      }
    };

    fetchProducts();
  }, []);

  // Save product state wrapper (persists on server & updates local storage)
  const saveProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    // 1. Local backup
    try {
      localStorage.setItem('bereket_products', JSON.stringify(newProducts));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // 2. Server persistence
    try {
      const token = sessionStorage.getItem('bereket_admin_token') || '';
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProducts),
      });
      if (!response.ok) {
        console.error('Failed to persist products to server. Status:', response.status);
      }
    } catch (err) {
      console.error('Error saving products to server:', err);
    }
  };

  // Add Product (Admin action)
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const id = 'custom_' + Date.now();
    const product: Product = { ...newProd, id };
    const updated = [product, ...products];
    saveProducts(updated);
  };

  // Update Product details (Admin action)
  const handleUpdateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    saveProducts(updated);
  };

  // Toggle inStock directly (Super handy inline admin switch!)
  const handleToggleStock = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextState = !p.inStock;
        // If becoming out of stock, remove from cart
        if (!nextState) {
          setCart(prev => prev.filter(item => item.product.id !== productId));
        }
        return { ...p, inStock: nextState };
      }
      return p;
    });
    saveProducts(updated);
  };

  // Delete Product completely (Admin action)
  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    // Remove from Cart
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  // Reset database back to seed list (Admin action)
  const handleResetToDefaults = () => {
    saveProducts(INITIAL_PRODUCTS);
    setCart([]);
  };

  // Cart quantity changes
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) => {
        const exists = prev.find((item) => item.product.id === productId);
        if (exists) {
          return prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
        } else {
          return [...prev, { product, quantity }];
        }
      });
    }
  };

  // Reset cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Admin login check on the secure back-end API
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAdminMode(true);
        setIsAdminOverlayOpen(false);
        sessionStorage.setItem('bereket_admin_token', data.token);
        setAdminPasswordInput('');
      } else {
        setAdminError(data.error || 'Şifre hatalı! Yalnızca mağaza yöneticisi erişebilir.');
      }
    } catch (err) {
      setAdminError('Sunucu bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Filter & Search criteria computation
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || p.category === activeTab;
    const matchesStock = !hideOutOfStock || p.inStock;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

          <div className="flex items-center gap-2">
            {/* Admin Console Switcher */}
            {isAdminMode ? (
              <button
                id="btn-logout-admin"
                onClick={() => setIsAdminMode(false)}
                className="flex items-center gap-1 text-xs font-bold bg-rose-500/25 border border-rose-400/40 hover:bg-rose-500 text-white rounded-xl px-3 py-2 transition-all cursor-pointer"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Выйти из админки</span>
              </button>
            ) : (
              <button
                id="btn-open-admin-overlay"
                onClick={() => setIsAdminOverlayOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-3 py-2 transition-all cursor-pointer"
              >
                <Shield size={13} className="text-amber-200" />
                <span>Администратор</span>
              </button>
            )}

            {/* Shopping Cart Trigger Icon */}
            <button
              id="btn-open-cart-floating"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold p-2.5 shadow-sm transition-all flex items-center justify-center cursor-pointer"
              title="Корзина"
            >
              <ShoppingCart size={18} />
              {totalCartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
                  {totalCartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Category Menu (Toggle Menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              id="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Sidebar Panel Slide-in from Left */}
            <motion.div
              id="mobile-menu-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col text-left font-sans"
            >
              {/* Header inside side drawer */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-sky-50/40">
                <div className="flex items-center gap-2 text-left">
                  <Logo className="h-9 w-9 shrink-0 bg-white p-0.5 rounded-xl shadow-sm border border-gray-100" showText={false} />
                  <div className="flex flex-col font-sans uppercase leading-none select-none text-sky-950">
                    <span className="text-[11px] font-black tracking-wider">
                      BEREKET ET
                    </span>
                    <span className="text-[10px] font-black tracking-wider text-amber-600 mt-0.5">
                      DÜNYASI
                    </span>
                  </div>
                </div>
                <button
                  id="btn-close-mobile-menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-800 cursor-pointer"
                  title="Kapat"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category Options Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-[10px] font-medium uppercase text-gray-400 tracking-widest mb-3 px-1">
                  Категории / Kategoriler
                </p>

                {/* "Все" (Show All) option */}
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
                    <span>Все товары</span>
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

              {/* Informative Footer within drawer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 space-y-1">
                <p className="font-extrabold text-gray-700 text-[11px] tracking-wide">BEREKET ET DÜNYASI</p>
                <p className="text-gray-400">Свежие продукты с доставкой.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">

        {/* Admin Dashboard Control Frame */}
        {isAdminMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-5 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Авторизован: Режим управления</span>
              </div>
              
              <button
                id="btn-fast-exit-admin"
                onClick={() => {
                  setIsAdminMode(false);
                  sessionStorage.removeItem('bereket_admin_token');
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 cursor-pointer"
              >
                Закрыть панель
              </button>
            </div>
            
            <AdminPanel
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetToDefaults={handleResetToDefaults}
            />
          </motion.div>
        )}

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
                🔍 Все ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`tab-${cat.id}`}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === cat.id
                      ? 'bg-sky-650 text-white shadow-sm font-semibold'
                      : 'bg-gray-150 text-gray-600 hover:bg-gray-200'
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
                Только в наличии
              </button>

              {/* Dynamic search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  id="catalog-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск товаров..."
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

          {/* Catalog Listing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredProducts.map((p) => {
                const itemInCart = cart.find((item) => item.product.id === p.id);
                const quantity = itemInCart ? itemInCart.quantity : 0;
                
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantityInCart={quantity}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    isAdminMode={isAdminMode}
                    onToggleStock={handleToggleStock}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty Search / Filter state */}
          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 py-16 text-center shadow-sm">
              <span className="text-4xl text-gray-300 block mb-2">🔎</span>
              <p className="font-bold text-gray-700">Товары не найдены</p>
              <p className="text-xs text-gray-400 mt-1">
                Попробуйте изменить категорию или изменить параметры поиска.
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
            Официальный магазин «Bereket Et Dünyası» — свежее мясо халяль, отборная бакалея и качественные фермерские продукты. Все права защищены © 2026.
          </p>
        </div>
      </footer>

      {/* Persistent Sticky Cart Action Bar for Mobile Users */}
      {totalCartItemsCount > 0 && !isAdminMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
          <button
            id="btn-floating-cart-bar"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#24A1DE] text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart size={16} />
              </div>
              <span className="text-xs">Выбрано позиций: {totalCartItemsCount}</span>
            </div>
            
            <span className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex items-center gap-0.5">
              В корзину
              <ChevronRight size={12} />
            </span>
          </button>
        </div>
      )}

      {/* Password Authentication Overlay Modal for Admin Panel */}
      <AnimatePresence>
        {isAdminOverlayOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminOverlayOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Screen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-x-4 top-[15%] mx-auto max-w-sm z-50 bg-white rounded-3xl border border-gray-100 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="flex justify-center mb-1">
                <Logo className="h-20 w-20" showText={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-700">
                  <Lock size={16} />
                  <h3 className="font-sans text-sm font-bold text-gray-800">Вход для администрации</h3>
                </div>
                <button
                  id="btn-close-admin-overlay"
                  onClick={() => setIsAdminOverlayOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 text-left">
                    Системный пароль
                  </label>
                  <input
                    type="password"
                    id="admin-password-input"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-bold tracking-widest text-gray-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {adminError && (
                  <p className="text-xs text-rose-650 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-left">
                    ⚠️ {adminError}
                  </p>
                )}

                <button
                  type="submit"
                  id="btn-confirm-admin-login"
                  className="w-full bg-[#24A1DE] hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs transition-colors"
                >
                  Войти
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Sidebar Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
      />

    </div>
  );
}
