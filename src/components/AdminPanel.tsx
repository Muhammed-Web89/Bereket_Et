import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Image, 
  Upload, 
  Check, 
  AlertCircle, 
  Edit2, 
  RotateCcw, 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../data';

interface AdminPanelProps {
  products: Product[];
  onRefreshProducts: () => void;
}

interface ConfigState {
  googleSheetsUrl: string;
  lastSynced: string;
  syncError: string;
  productCount: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onRefreshProducts
}) => {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setGoogleSheetsUrl(data.googleSheetsUrl || '');
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const token = sessionStorage.getItem('bereket_admin_token') || '';
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ googleSheetsUrl: googleSheetsUrl.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setSuccessMsg('Google Sheets URL başarıyla kaydedildi!');
        onRefreshProducts(); // Reload products in parent
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Ayarlar kaydedilemedi.');
      }
    } catch (err) {
      setErrorMsg('Bir ağ hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSync = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSyncing(true);

    const token = sessionStorage.getItem('bereket_admin_token') || '';
    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setConfig(data.config);
        setSuccessMsg('Google Sheets başarıyla senkronize edildi!');
        onRefreshProducts(); // Reload products in parent
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Senkronizasyon başarısız oldu.');
      }
    } catch (err) {
      setErrorMsg('Senkronizasyon sırasında bir ağ hatası oluştu.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to format date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Hiç senkronize edilmedi';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Google Sheets Integration Section */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="text-sky-600" size={22} />
            <h2 className="font-sans text-lg font-bold text-gray-800">Google Sheets Entegrasyonu</h2>
          </div>

          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Ürün katalog veritabanınızı bir Google E-Tablo aracılığıyla dinamik olarak listeleyebilir ve güncelleyebilirsiniz. Bu sayede admin panelinden elle eklemek yerine tüm listenizi tek seferde yönetebilirsiniz.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Google Sheets CSV URL (Web'de Yayınlanan URL)
              </label>
              <input
                type="url"
                required
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || isSyncing}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl hover:shadow transition-all text-xs disabled:opacity-50 cursor-pointer text-center"
              >
                {isLoading ? 'Kaydediliyor...' : 'Bağlantıyı Kaydet'}
              </button>
              
              {config?.googleSheetsUrl && (
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isLoading || isSyncing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl hover:shadow transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  Şimdi Senkronize Et
                </button>
              )}
            </div>
          </form>

          {/* Sync Status Info */}
          {config && (
            <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-150 text-xs space-y-2">
              <span className="font-bold text-gray-600 uppercase tracking-wide text-[10px] block border-b pb-1.5 mb-2">Senkronizasyon Durumu</span>
              
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Son Güncelleme:</span>
                <span className="font-bold text-gray-700">{formatDate(config.lastSynced)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Aktif Ürün Sayısı:</span>
                <span className="font-bold text-emerald-600">{config.productCount} adet</span>
              </div>

              {config.syncError && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-600 font-bold flex gap-1.5 items-start">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  <span>Hata: {config.syncError}</span>
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-bold text-rose-600 text-left"
              >
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-bold text-emerald-600 text-left"
              >
                <Check size={14} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic step-by-step instructions */}
        <div className="mt-6 border-t border-gray-100 pt-4 text-left">
          <div className="flex items-center gap-1.5 text-gray-700 mb-2 font-bold text-xs">
            <Info size={14} className="text-sky-600" />
            <span>Google Sheet Nasıl Bağlanır? (Nasıl Yayınlanır?)</span>
          </div>
          <ol className="list-decimal pl-4 text-[10px] text-gray-500 space-y-1 leading-relaxed">
            <li>Google E-Tablolar'da ürün listenizi hazırlayın.</li>
            <li>Tablo üst menüsünden <strong>Dosya &gt; Paylaş &gt; Web'de yayınla</strong> seçeneğine gidin.</li>
            <li>Açılan pencerede 'Tüm Belge' yerine ilgili çalışma sayfasını, biçim olarak ise <strong>Virgülle ayrılmış değerler (.csv)</strong> seçeneğini seçip <strong>Yayınla</strong> deyin.</li>
            <li>Oluşan bağlantıyı (URL'yi) kopyalayarak yukarıdaki alana yapıştırıp kaydedin.</li>
          </ol>
          <div className="mt-2.5 flex items-center gap-1.5">
            <a 
              href="https://docs.google.com/spreadsheets" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-1"
            >
              Google E-Tablolara Git <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Synced Products Dashboard List */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-base font-bold text-gray-800">Senkronize Edilen Ürün Listesi</h2>
            <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {products.length} ürün aktif
            </span>
          </div>
          
          {config?.googleSheetsUrl && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100 font-bold">
              🟢 Google Sheets ile Canlı
            </span>
          )}
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-50 bg-gray-50/40 hover:border-gray-200 transition-all"
            >
              {/* Product Tiny Thumbnail */}
              {product.image && (
                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Info Block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(() => {
                    const matchedCat = CATEGORIES.find(c => c.id === product.category);
                    return matchedCat ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">
                        {matchedCat.emoji} {matchedCat.name}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {product.category}
                      </span>
                    );
                  })()}
                  {!product.inStock && (
                    <span className="text-[9px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100">
                      Stokta Yok
                    </span>
                  )}
                </div>
                <h4 className="font-sans text-xs font-semibold text-gray-800 truncate mt-1">
                  {product.name}
                </h4>
              </div>

              {/* Price Tag Block */}
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-gray-900 block">{product.price} TL</span>
                <span className="text-[9px] text-gray-400 font-bold block">/{product.unit}</span>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-16">
              <span className="text-3xl block mb-2">📊</span>
              <p className="text-xs text-gray-400 font-medium">Aktif senkronize edilmiş ürün bulunmamaktadır.</p>
              <p className="text-[11px] text-gray-500 mt-1">Lütfen geçerli bir Google Sheet CSV URL ekleyerek güncelleyin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
