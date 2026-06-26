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
  Menu,
  Lock,
  RefreshCw,
  Upload,
  Copy,
  Check,
  LogOut,
  Info,
  Sparkles
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

  // Admin & Image Uploader states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // Image Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedStatus, setUploadedStatus] = useState('');
  const [customImageName, setCustomImageName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [originalSize, setOriginalSize] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<string>('');

  // Fetch admin configurations
  const fetchConfig = async (token: string) => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.googleSheetsUrl) {
          setSheetUrl(data.googleSheetsUrl);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verify token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('bereket_admin_token');
    if (savedToken) {
      fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setIsAdminLoggedIn(true);
            setAdminToken(savedToken);
            fetchConfig(savedToken);
          } else {
            localStorage.removeItem('bereket_admin_token');
          }
        })
        .catch(err => {
          console.error(err);
          localStorage.removeItem('bereket_admin_token');
        });
    }
  }, []);

  // Handle Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bereket_admin_token', data.token);
        setAdminToken(data.token);
        setIsAdminLoggedIn(true);
        setLoginError('');
        setAdminPassword('');
        fetchConfig(data.token);
      } else {
        setLoginError(data.error || 'Şifre hatalı!');
      }
    } catch (err) {
      setLoginError('Bağlantı hatası oluştu!');
    }
  };

  // Handle Sheet URL Save
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setSyncStatus('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ googleSheetsUrl: sheetUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus('Ayarlar başarıyla kaydedildi!');
      } else {
        setSyncStatus(`Hata: ${data.error || 'Kaydedilemedi'}`);
      }
    } catch (err) {
      setSyncStatus('Bağlantı hatası oluştu!');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Handle Sheets Manual Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Eşitleme başlatılıyor...');
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus(`Başarılı! ${data.count} ürün Google Sheets üzerinden eşitlendi.`);
        fetchProducts(); // Refresh local list
      } else {
        setSyncStatus(`Eşitleme başarısız: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      setSyncStatus('Eşitleme hatası oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Logout
  const handleAdminLogout = () => {
    localStorage.removeItem('bereket_admin_token');
    setAdminToken('');
    setIsAdminLoggedIn(false);
    setSheetUrl('');
    setUploadedUrl('');
    setImagePreview(null);
  };

  // Compress and Upload Image helper
  const handleImageCompressAndUpload = (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadedStatus('Görsel optimize ediliyor ve dönüştürülüyor...');
    setUploadedUrl('');
    setImagePreview(null);

    const origSizeKB = (file.size / 1024).toFixed(1);
    setOriginalSize(`${origSizeKB} KB`);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64Compressed = canvas.toDataURL('image/jpeg', 0.82);
          
          const compSizeKB = Math.round((base64Compressed.length * 3) / 4 / 1024);
          setCompressedSize(`${compSizeKB} KB`);

          setUploadedStatus('Resim sunucuya yükleniyor...');
          
          fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              image: base64Compressed,
              name: customImageName || file.name.split('.')[0]
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                const fullUrl = `${window.location.origin}${data.url}`;
                setUploadedUrl(fullUrl);
                setUploadedStatus('Harika! Görsel başarıyla yüklendi.');
                setImagePreview(fullUrl);
              } else {
                setUploadedStatus(`Hata: ${data.error || 'Yüklenemedi'}`);
              }
            })
            .catch(err => {
              console.error(err);
              setUploadedStatus('Yükleme hatası oluştu!');
            })
            .finally(() => {
              setUploading(false);
            });
        }
      };
    };
  };

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
              title="Категории"
              aria-label="Открыть категории"
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
              <span>Корзина</span>
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
                  <span className="text-xs font-black tracking-wider text-gray-800 uppercase">КАТЕГОРИИ</span>
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
                  Разделы магазина
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
                    <span>Все продукты</span>
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
                <p className="text-gray-400">Свежее халяльное мясо и деликатесы.</p>
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
                🔍 Все ({products.length})
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
                  placeholder="Поиск продуктов..."
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
              <p className="font-bold text-gray-700">Продукты не найдены</p>
              <p className="text-xs text-gray-400 mt-1">
                Пожалуйста, измените поисковый запрос или выберите другую категорию.
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
            «Bereket Et Dünyası» Resmi Mağazası — taze helal et, kaliteli şarküteri ve çiftlik ürünleri. Tüm hakları saklıdır © 2026.
          </p>
          <div>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-gray-300 hover:text-[#24A1DE] mt-4 text-[10px] uppercase tracking-widest font-extrabold transition-colors cursor-pointer"
            >
              🔑 Yönetici Paneli & Görsel Yükleyici
            </button>
          </div>
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
              <span className="text-xs">В корзине {totalCartItemsCount} тов.</span>
            </div>
            
            <span className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex items-center gap-0.5">
              Открыть корзину
              <ChevronRight size={12} />
            </span>
          </button>
        </div>
      )}

      {/* Checkout Sidebar Cart Drawer */}
      <CartDrawer />

      {/* Admin Panel Modal Backdrop */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col my-8 max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#24A1DE] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={18} />
                  <span className="font-extrabold tracking-tight">Bereket Et Dünyası Yönetici Paneli</span>
                </div>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {!isAdminLoggedIn ? (
                  /* Admin Login Form */
                  <form onSubmit={handleAdminLogin} className="space-y-4 py-4">
                    <div className="text-center space-y-1">
                      <p className="text-base font-bold text-gray-800">Yönetici Oturumu Açın</p>
                      <p className="text-xs text-gray-400">Ürün görsel yükleme ve Google Sheets eşitleme işlemleri için şifrenizi girin.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Giriş Şifresi</label>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-250 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#24A1DE]"
                      />
                    </div>

                    {loginError && (
                      <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-center font-bold">
                        ⚠️ {loginError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#24A1DE] hover:bg-sky-600 text-white font-black py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                    >
                      Giriş Yap
                    </button>
                  </form>
                ) : (
                  /* Admin Dashboard */
                  <div className="space-y-6">
                    {/* Logged In Indicator & Tabs */}
                    <div className="flex items-center justify-between bg-sky-50 border border-sky-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-[#24A1DE] font-bold text-xs">
                        <Sparkles size={16} />
                        <span>Oturum Açıldı</span>
                      </div>
                      <button
                        onClick={handleAdminLogout}
                        className="text-gray-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut size={14} />
                        Güvenli Çıkış
                      </button>
                    </div>

                    {/* Section 1: Google Sheets Synchronization */}
                    <div className="space-y-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 font-black text-xs text-gray-700">
                        <RefreshCw size={14} className="text-[#24A1DE]" />
                        <span>Google Sheets Ürün Eşitleme</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Ürün kataloğunuzu Google E-Tabloları üzerinden yönetirsiniz. Değişiklik yaptığınızda buradan eşitleyebilirsiniz.
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500">Google E-Tablo CSV Linki</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                            className="flex-1 rounded-xl border border-gray-250 bg-white px-3 py-2 text-[11px] focus:outline-none focus:border-[#24A1DE] font-mono text-gray-600"
                          />
                          <button
                            onClick={handleSaveConfig}
                            disabled={isSavingConfig}
                            className="bg-gray-800 hover:bg-gray-900 text-white font-extrabold px-3 py-2 rounded-xl text-[10px] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isSavingConfig ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="w-full bg-[#24A1DE] hover:bg-sky-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? 'Eşitleniyor (Bekleyin)...' : 'Şimdi Google Sheets\'ten Güncelle'}
                      </button>

                      {syncStatus && (
                        <div className="text-[10px] bg-white border border-gray-150 p-2.5 rounded-xl text-gray-600 font-medium">
                          🔔 {syncStatus}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Pratik Görsel Yükleyici */}
                    <div className="space-y-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 font-black text-xs text-gray-700">
                        <Upload size={14} className="text-[#24A1DE]" />
                        <span>Pratik Görsel Yükleme ve Optimizasyon</span>
                      </div>

                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Fotoğrafları telefonunuzdan veya bilgisayarınızdan doğrudan buraya yükleyin. Sistem görseli otomatik olarak **yeniden boyutlandırır, sıkıştırır ve Webp/JPEG** biçimine çevirerek sitenin hızlı açılmasını sağlar!
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500">Ürün Adı (Görsel Adı İçin Örn: Kuzu Pirzola)</label>
                        <input
                          type="text"
                          value={customImageName}
                          onChange={(e) => setCustomImageName(e.target.value)}
                          placeholder="ornek_kuzu_pirzola"
                          className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#24A1DE]"
                        />
                      </div>

                      {/* Drop Zone / Input File */}
                      <div className="border-2 border-dashed border-gray-250 hover:border-[#24A1DE] bg-white rounded-2xl p-6 transition-all text-center relative flex flex-col items-center justify-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageCompressAndUpload(file);
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                        <Upload size={24} className="text-gray-400 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-700">Görsel Seçin veya Sürükleyin</p>
                          <p className="text-[9px] text-gray-400">Maksimum boyutta fotoğraflar bile otomatik optimize edilir</p>
                        </div>
                      </div>

                      {/* Upload status / statistics */}
                      {uploadedStatus && (
                        <div className="text-[10px] font-bold bg-white border border-gray-150 p-2.5 rounded-xl text-sky-700 space-y-1">
                          <p>{uploadedStatus}</p>
                          {originalSize && compressedSize && (
                            <div className="flex gap-4 text-gray-400 font-normal text-[9px] pt-1 border-t border-gray-100">
                              <span>Orijinal: <strong className="text-gray-600">{originalSize}</strong></span>
                              <span>Optimize: <strong className="text-emerald-600">{compressedSize} (Süper Hızlı)</strong></span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resulting copyable Link */}
                      {uploadedUrl && (
                        <div className="space-y-2 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
                          <p className="text-[10px] font-extrabold text-emerald-800">📋 Google Sheets'e Yapıştırılacak Link:</p>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              readOnly
                              value={uploadedUrl}
                              className="flex-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[9px] font-mono text-emerald-700 select-all"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(uploadedUrl);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              {isCopied ? <Check size={11} /> : <Copy size={11} />}
                              {isCopied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                          </div>

                          <div className="flex items-start gap-1.5 text-gray-500 text-[9px] leading-tight pt-1">
                            <Info size={12} className="text-[#24A1DE] shrink-0 mt-0.5" />
                            <p>
                              Bu linki kopyalayıp Google Tablonuzun ilgili ürün satırındaki <strong>Resim (Image)</strong> sütununa yapıştırıp "Şimdi Google Sheets'ten Güncelle" demeniz yeterlidir!
                            </p>
                          </div>

                          {imagePreview && (
                            <div className="pt-2 flex justify-center">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                referrerPolicy="no-referrer"
                                className="h-20 w-20 object-cover rounded-lg border border-emerald-200 shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
