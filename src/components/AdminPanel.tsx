import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { PlusCircle, Trash2, Image, Upload, Check, AlertCircle, Edit2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../data';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetToDefaults: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetToDefaults
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]?.id || 'meat');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested quick images for easy select
  const presetImages: Record<string, { label: string; url: string }[]> = {
    meat: [
      { label: '🥩 Дана Кыймы / Говядина', url: 'https://images.unsplash.com/photo-1588168333986-5079a17a080e?w=500&auto=format&fit=crop&q=80' },
      { label: '🍖 Кузу / Баранина', url: 'https://images.unsplash.com/photo-1602847213180-50e43a80eeef?w=500&auto=format&fit=crop&q=80' },
      { label: '🍗 Курица / Птица', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' }
    ],
    fish: [
      { label: '🐟 Рыба / Морепродукты', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80' }
    ],
    dairy: [
      { label: '🥛 Молочные продукты', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80' }
    ],
    groceries: [
      { label: '🌾 Крупы и бобовые', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80' }
    ]
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Размер изображения слишком велик (максимум 2МБ).');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageUrl(''); // Clear URL input when file is loaded
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Название товара не может быть пустым.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Пожалуйста, введите корректную цену.');
      return;
    }

    const finalImage = imagePreview || imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

    onAddProduct({
      name: name.trim(),
      price: parsedPrice,
      category,
      unit,
      description: description.trim(),
      image: finalImage,
      inStock: true
    });

    setSuccessMsg('Товар успешно добавлен в каталог!');
    setName('');
    setPrice('');
    setUnit('kg');
    setDescription('');
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStartEditPrice = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(product.price.toString());
  };

  const handleSavePrice = (product: Product) => {
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Пожалуйста, введите корректную цену.');
      return;
    }
    onUpdateProduct({
      ...product,
      price: parsedPrice
    });
    setEditingProductId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Add New Product Section */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="text-sky-600" size={20} />
          <h2 className="font-sans text-lg font-bold text-gray-800">Добавить новый товар</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Категория
            </label>
            <select
              id="select-product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-sky-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Название товара
            </label>
            <input
              type="text"
              id="input-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр: Говяжий фарш, Сыр..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Цена (TL)
              </label>
              <input
                type="number"
                id="input-product-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Напр: 480"
                min="0.1"
                step="any"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Единица измерения
              </label>
              <select
                id="select-product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-sky-500"
              >
                <option value="кг">кг (Kilo)</option>
                <option value="шт">шт (Adet)</option>
                <option value="уп">уп (Paket)</option>
                <option value="л">л (Litre)</option>
                <option value="пучок">пучок (Bağ)</option>
                <option value="короб">короб (Koli)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Описание (Необязательно)
            </label>
            <textarea
              id="input-product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Свойства товара, особенности..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Фотография товара
            </label>
            
            {/* Direct URL Input with Free Upload Helper */}
            <div className="space-y-2 bg-sky-50/30 p-3.5 rounded-xl border border-sky-100/60">
              <label className="block text-[11px] font-bold text-[#1471a1] uppercase tracking-wide">
                🔗 Ссылка на фото (Рекомендуется)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://site.com/photo.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrl(val);
                    if (val.trim()) {
                      setImagePreview(val.trim());
                    } else {
                      setImagePreview(null);
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-sky-500"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview(null);
                    }}
                    className="px-2.5 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-500 font-bold"
                  >
                    Очистить
                  </button>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-gray-400 font-medium leading-tight">
                  Вы можете использовать адрес картинки, скопированный из интернета.
                </span>
                
                {/* Free Upload Helper Link Button */}
                <a
                  href="https://postimages.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-705 px-2 py-1 rounded shadow-sm inline-flex items-center gap-1 transition-colors flex-shrink-0 self-start sm:self-center cursor-pointer"
                  title="Бесплатный сервис хостинга изображений"
                >
                  📤 Бесплатный сервис загрузки картинок
                </a>
              </div>
            </div>

            {/* Local uploader */}
            <div className="flex items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 px-4 py-4 hover:bg-gray-50 transition-colors">
              <div id="file-uploader-container" className="text-center flex-1">
                <Upload className="mx-auto text-gray-400 mb-1.5" size={20} />
                <span className="text-[11px] font-bold text-gray-500 block">Или выберите файл на устройстве</span>
                <input
                  type="file"
                  id="file-upload-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  id="btn-trigger-upload"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-100 hover:bg-sky-100 cursor-pointer"
                >
                  Обзор
                </button>
              </div>

              {imagePreview && (
                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 shadow-sm flex-shrink-0 bg-white">
                  <img src={imagePreview} alt="О önизleme" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] hover:bg-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-left bg-gray-50 p-2.5 rounded-xl border border-gray-150">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">💡 Полезный совет:</span>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                Вы можете загрузить свое фото на сайт Postimages и вставить в поле ввода полученную <strong>«Прямую ссылку» (Direct Link)</strong>. Это бесплатно и надежно.
              </p>
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-gray-400 font-medium block mb-1">Или выберите готовые варианты:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {(presetImages[category] || [
                  { label: '🥩 Мясо и мясная продукция', url: 'https://images.unsplash.com/photo-1588168333986-5079a17a080e?w=500&auto=format&fit=crop&q=80' },
                  { label: '🌾 Продукты питания', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' }
                ]).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImagePreview(preset.url);
                      setImageUrl('');
                    }}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                      imagePreview === preset.url ? 'border-sky-500 bg-sky-50/50 text-sky-700 font-semibold' : 'border-gray-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[9px] bg-white border border-gray-100 px-1 py-0.5 rounded text-gray-400">Выбрать</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-bold text-rose-600 text-left"
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
                className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-bold text-emerald-600 text-left"
              >
                <Check size={14} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            id="btn-submit-product"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl hover:shadow transition-all cursor-pointer text-sm"
          >
            Добавить товар в каталог
          </button>
        </form>
      </div>

      {/* Existing Products Dashboard Panel */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-bold text-gray-800">Список и редактирование товаров</h2>
            <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {products.length} товаров
            </span>
          </div>
          
          <button
            id="btn-reset-defaults"
            onClick={() => {
              if (window.confirm('Вы действительно хотите восстановить товары по умолчанию? Все ваши добавленные товары будут сброшены.')) {
                onResetToDefaults();
              }
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-sky-600 cursor-pointer bg-gray-50 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-all"
            title="Сбросить каталог"
          >
            <RotateCcw size={12} />
            Сбросить каталог
          </button>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition-all"
            >
              {/* Product Tiny Thumbnail */}
              <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(() => {
                    const matchedCat = CATEGORIES.find(c => c.id === product.category);
                    return matchedCat ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700">
                        {matchedCat.emoji} {matchedCat.name}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-450">
                        {product.category}
                      </span>
                    );
                  })()}
                  {!product.inStock && (
                    <span className="text-[9px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-md border border-rose-100">
                      Нет в наличии
                    </span>
                  )}
                </div>
                <h4 className="font-sans text-sm font-semibold text-gray-800 truncate mt-1">
                  {product.name}
                </h4>
              </div>

              {/* Price Editor Block */}
              <div className="flex items-center gap-2">
                {editingProductId === product.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-16 rounded-lg border border-sky-400 bg-white px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none"
                      min="1"
                    />
                    <button
                      id={`btn-save-price-${product.id}`}
                      onClick={() => handleSavePrice(product)}
                      className="p-1 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
                      title="Сохранить"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-right">
                    <div>
                      <span className="text-sm font-bold text-gray-900">{product.price} TL</span>
                      <span className="text-[10px] text-gray-400 block font-semibold">/{product.unit}</span>
                    </div>
                    <button
                      id={`btn-edit-price-${product.id}`}
                      onClick={() => handleStartEditPrice(product)}
                      className="p-1 text-gray-400 hover:text-sky-600 cursor-pointer"
                      title="Изменить цену"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}

                {/* Remove Trash */}
                <button
                  id={`btn-delete-${product.id}`}
                  onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                  title="Удалить товар"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-center py-12">
              <span className="text-3xl">🧺</span>
              <p className="mt-2 text-sm text-gray-400 font-medium">В каталоге пока нет ни одного товара.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
