import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Send, ShoppingBag, Trash2, Copy, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'gel_al' | 'adrese_teslim'>('gel_al');
  const [address, setAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showSentSuccess, setShowSentSuccess] = useState(false);

  const totalAmount = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Generate beautiful message for Telegram
  const generateMessage = () => {
    let msg = `🥩 *ЗАКАЗ BEREKET МАРКЕТ* 🌾\n`;
    msg += `-------------------------------------------\n`;
    msg += `👤 *Клиент:* ${customerName || 'Не указан'}\n`;
    if (customerPhone) {
      msg += `📞 *Телефон:* ${customerPhone}\n`;
    }
    msg += `🚚 *Получение:* ${deliveryType === 'gel_al' ? 'Самовывоз из магазина' : 'Доставка на адрес'}\n`;
    if (deliveryType === 'adrese_teslim' && address) {
      msg += `📍 *Адрес:* ${address}\n`;
    }
    msg += `-------------------------------------------\n`;
    msg += `📦 *ТОВАРЫ:*\n`;
    
    cart.forEach((item) => {
      const lineTotal = item.product.price * item.quantity;
      msg += `• ${item.quantity} ${item.product.unit} x ${item.product.name} (Цена: ${item.product.price} TL) = *${lineTotal} TL*\n`;
    });
    
    msg += `-------------------------------------------\n`;
    msg += `💵 *ИТОГОВАЯ СУММА:* *${totalAmount} TL*\n`;
    msg += `-------------------------------------------\n`;
    msg += `⚡ _Пожалуйста, отправьте это сообщение администратору t.me/Bereket_ett1 для подтверждения заказа._`;
    return msg;
  };

  const handleCopyMessage = () => {
    const text = generateMessage();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendToTelegram = () => {
    if (cart.length === 0) return;
    
    const text = generateMessage();
    const encodedText = encodeURIComponent(text);
    
    // Copy order text automatically to clipboard
    try {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text safely', err);
    }
    
    // Show instruction popup modal for maximum accessibility
    setShowSentSuccess(true);

    // Open the direct username to start chat instantly with prefilled text
    window.open(`https://t.me/Bereket_ett1?text=${encodedText}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-gray-50 shadow-2xl flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-gray-800">Ваша корзина</h3>
                  <p className="text-xs text-gray-400 font-semibold">Позиций: {cart.length}</p>
                </div>
              </div>
              <button
                id="btn-close-cart"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">🛒</span>
                  <p className="font-semibold text-gray-700">Корзина пуста</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Выберите свежее мясо, качественную бакалею и другие товары в каталоге, чтобы добавить их сюда.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Выбранные товары</span>
                      <button
                        id="btn-clear-cart"
                        onClick={onClearCart}
                        className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 size={12} />
                        Очистить
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-gray-800 truncate" title={item.product.name}>
                                {item.product.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold">
                                {item.product.price} TL / {item.product.unit}
                              </p>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100 flex-shrink-0">
                            <button
                              id={`cart-decrease-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 rounded bg-white border border-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-100 cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-increase-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 rounded bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-50 pt-2 flex items-center justify-between font-bold text-gray-800">
                      <span>Итого товаров:</span>
                      <span className="text-base text-sky-600">{totalAmount} TL</span>
                    </div>
                  </div>

                  {/* Customer Checkout Form info */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Информация о получателе</span>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Имя и фамилия</label>
                      <input
                        type="text"
                        id="cart-customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Например: Иван Иванов"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Номер телефона (Рекомендуется)</label>
                      <input
                        type="tel"
                        id="cart-customer-phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Например: +90 555 XXXXXXX"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Способ доставки</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          id="delivery-gel-al"
                          onClick={() => setDeliveryType('gel_al')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer text-center ${
                            deliveryType === 'gel_al'
                              ? 'bg-sky-50 border-sky-200 text-sky-700'
                              : 'bg-gray-50/50 border-gray-100 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          🏪 Самовывоз
                        </button>
                        <button
                          type="button"
                          id="delivery-adrese-teslim"
                          onClick={() => setDeliveryType('adrese_teslim')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold border cursor-pointer text-center ${
                            deliveryType === 'adrese_teslim'
                              ? 'bg-sky-50 border-sky-200 text-sky-700'
                              : 'bg-gray-50/50 border-gray-100 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          🛵 Доставка на дом
                        </button>
                      </div>
                    </div>

                    {deliveryType === 'adrese_teslim' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">Адрес доставки</label>
                        <textarea
                          id="cart-address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Укажите улицу, номер дома, квартиру, этаж и другие подробности..."
                          rows={2}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50/50 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sticky Order Action bottom bar */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-4 space-y-3 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between text-gray-800">
                  <span className="font-semibold text-sm">Ориентировочная сумма:</span>
                  <span className="text-xl font-black text-sky-600">{totalAmount} TL</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-copy-checkout"
                    onClick={handleCopyMessage}
                    className={`flex items-center justify-center gap-1 font-bold text-xs py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        Скопировано!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Скопировать
                      </>
                    )}
                  </button>

                  <button
                    id="btn-goto-telegram-profile"
                    onClick={() => window.open('https://t.me/Bereket_ett1', '_blank')}
                    className="flex items-center justify-center gap-1 font-bold text-xs py-3 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all border border-gray-200 cursor-pointer"
                  >
                    <MessageSquare size={14} className="text-sky-600" />
                    Написать напрямую
                  </button>
                </div>

                <button
                  id="btn-send-telegram"
                  onClick={handleSendToTelegram}
                  className="w-full bg-[#24A1DE] hover:bg-[#1E88BE] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow transition-all cursor-pointer text-sm"
                >
                  <Send size={15} />
                  Заказать через Telegram
                </button>
                
                <p className="text-[10px] text-gray-400 font-semibold text-center italic leading-relaxed">
                  Оплата производится наличными или картой прямо при получении заказа. Вы заказываете безопасно.
                </p>
              </div>
            )}
          </motion.div>

          {/* Success Instructions Modal Overlay */}
          <AnimatePresence>
            {showSentSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              >
                <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-5 border border-gray-100">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                    <Check size={28} className="stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-sans text-lg font-black text-gray-800">Заказ сформирован!</h4>
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50/60 py-1.5 px-3 rounded-lg inline-block">
                      Детали заказа скопированы 📋
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium pt-2">
                      Чат Telegram открывается в новой вкладке. Удерживайте палец (или нажмите правой кнопкой мыши) на поле ввода и нажмите <strong>«ВСТАВИТЬ»</strong> (Paste), чтобы отправить ваш готовый заказ администратору.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="btn-modal-reopen-tg font-bold"
                      onClick={() => window.open(`https://t.me/Bereket_ett1?text=${encodeURIComponent(generateMessage())}`, '_blank')}
                      className="w-full bg-[#24A1DE] hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Send size={14} />
                      Перейти в чат
                    </button>
                    
                    <button
                      id="btn-modal-close"
                      onClick={() => {
                        setShowSentSuccess(false);
                        onClose();
                      }}
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Закрыть и продолжить
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};
