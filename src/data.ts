import { Product } from './types';

export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  colorClass: string;
}

export function normalizeCategory(cat: string): string {
  const c = (cat || '').toLowerCase().trim();
  
  if (c === 'myaso' || c === 'meat' || c === 'et' || c.includes('мясо')) return 'myaso';
  if (c === 'ryba' || c === 'fish' || c === 'balik' || c === 'balık' || c.includes('рыба')) return 'ryba';
  if (c === 'molochnoe' || c === 'dairy' || c === 'sut' || c === 'süt' || c.includes('şarküteri') || c.includes('sarkuteri') || c.includes('молоч') || c.includes('молок')) return 'molochnoe';
  if (c === 'detskoe' || c === 'baby' || c === 'bebek' || c === 'cocuk' || c === 'çocuk' || c.includes('детск') || c.includes('дети')) return 'detskoe';
  if (c === 'polufabrikaty' || c === 'semi_finished' || c === 'hazir' || c === 'hazır' || c.includes('полуфабрикат')) return 'polufabrikaty';
  if (c === 'konservy' || c === 'canned' || c === 'konserve' || c.includes('консерв')) return 'konservy';
  if (c === 'krupy' || c === 'grains' || c === 'bakliyat' || c === 'tahıl' || c === 'tahil' || c.includes('круп') || c.includes('бакале')) return 'krupy';
  if (c === 'orehi' || c === 'nuts' || c === 'kuruyemis' || c === 'kuruyemiş' || c.includes('орех') || c.includes('сухофрукт')) return 'orehi';
  if (c === 'specii' || c === 'spices' || c === 'sauces' || c === 'sos' || c === 'baharat' || c === 'yag' || c === 'yağ' || c.includes('специ') || c.includes('соус') || c.includes('масл')) return 'specii';
  if (c === 'shokolad' || c === 'chocolate' || c === 'cikolata' || c === 'çikolata' || c.includes('шоколад')) return 'shokolad';
  if (c === 'konfety' || c === 'candy' || c === 'seker' || c === 'şeker' || c.includes('сладост') || c.includes('конфет')) return 'konfety';
  if (c === 'karamel' || c === 'caramel' || c.includes('карамел')) return 'karamel';
  if (c === 'vypechka' || c === 'bakery' || c === 'firin' || c === 'fırın' || c === 'ekmek' || c === 'pasta' || c.includes('выпеч') || c.includes('кондитер')) return 'vypechka';
  if (c === 'napitki' || c === 'beverages' || c === 'icecek' || c === 'içecek' || c.includes('напит')) return 'napitki';
  if (c === 'chay_kofe' || c === 'tea_coffee' || c === 'cay' || c === 'çay' || c === 'kahve' || c.includes('чай') || c.includes('кофе')) return 'chay_kofe';
  if (c === 'himiya' || c === 'household_chem' || c === 'kimya' || c === 'deterjan' || c === 'temizlik' || c.includes('хим') || c.includes('гигиен')) return 'himiya';
  if (c === 'posuda' || c === 'household_goods' || c === 'ev' || c === 'zuccaciye' || c === 'züccaciye' || c.includes('посуд') || c.includes('дом')) return 'posuda';
  
  return 'drugoe';
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'myaso', name: 'Мясо и мясные продукты', emoji: '🥩', colorClass: 'bg-red-500 text-white' },
  { id: 'ryba', name: 'Рыба и морепродукты', emoji: '🐟', colorClass: 'bg-sky-500 text-white' },
  { id: 'molochnoe', name: 'Молочные продукты', emoji: '🥛', colorClass: 'bg-blue-400 text-white' },
  { id: 'detskoe', name: 'Детское питание', emoji: '👶', colorClass: 'bg-emerald-400 text-white' },
  { id: 'polufabrikaty', name: 'Полуфабрикаты и готовые блюда', emoji: '🍜', colorClass: 'bg-amber-600 text-white' },
  { id: 'konservy', name: 'Консервированные продукты', emoji: '🥫', colorClass: 'bg-orange-500 text-white' },
  { id: 'krupy', name: 'Крупы и бакалея', emoji: '🌾', colorClass: 'bg-yellow-600 text-white' },
  { id: 'orehi', name: 'Орехи и сухофрукты', emoji: '🥜', colorClass: 'bg-amber-700 text-white' },
  { id: 'specii', name: 'Соусы, специи и масла', emoji: '🧂', colorClass: 'bg-stone-500 text-white' },
  { id: 'shokolad', name: 'Шоколад', emoji: '🍫', colorClass: 'bg-amber-900 text-white' },
  { id: 'konfety', name: 'Сладости', emoji: '🍬', colorClass: 'bg-pink-400 text-white' },
  { id: 'karamel', name: 'Карамель', emoji: '🍭', colorClass: 'bg-rose-450 text-white' },
  { id: 'vypechka', name: 'Выпечка и кондитерские изделия', emoji: '🧁', colorClass: 'bg-fuchsia-500 text-white' },
  { id: 'napitki', name: 'Напитки', emoji: '🧃', colorClass: 'bg-teal-500 text-white' },
  { id: 'chay_kofe', name: 'Чай и кофе', emoji: '🍵', colorClass: 'bg-emerald-600 text-white' },
  { id: 'himiya', name: 'Бытовая химия и гигиена', emoji: '🧼', colorClass: 'bg-cyan-500 text-white' },
  { id: 'posuda', name: 'Посуда и товары для дома', emoji: '🏠', colorClass: 'bg-indigo-500 text-white' },
  { id: 'drugoe', name: 'Другое', emoji: '📦', colorClass: 'bg-slate-500 text-white' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Et ve Et Ürünleri (myaso)
  {
    id: 'k1',
    name: 'Говядина для гуляша (кусочками)',
    price: 520,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Идеальное, свежее бескостное мясо говядины для ваших блюд.'
  },
  {
    id: 'k2',
    name: 'Фарш говяжий (особый)',
    price: 480,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1588168333986-5079a17a080e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежевыжатый качественный говяжий фарш для котлет и других блюд.'
  },
  {
    id: 'k3',
    name: 'Бараньи ребрышки (пирзола)',
    price: 680,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1602847213180-50e43a80eeef?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежие и нежные бараньи ребрышки, идеально подходящие для гриля или сковороды.'
  },
  {
    id: 'k4',
    name: 'Котлеты из говядины (мясницкие)',
    price: 450,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Сочные и вкусные готовые говяжьи котлеты, приготовленные по нашему особому рецепту со специями.'
  },
  {
    id: 'k5',
    name: 'Анtreкот из говядины',
    price: 720,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Сочный и нежный антрекот из говядины для жарки на гриле.'
  },
  {
    id: 'k6',
    name: 'Куриное бедро (без кости)',
    price: 180,
    category: 'myaso',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежее куриное филе бедра без кости для запекания, шашлыка или жарки.'
  },

  // 3. Süt ve Süt Ürünleri (molochnoe)
  {
    id: 'b4',
    name: 'Йогурт Сузьма (процеженный)',
    price: 95,
    category: 'molochnoe',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'ведро (1.5 кг)',
    description: 'Густой натуральный процеженный йогурт традиционного приготовления. Без добавок.'
  },

  // 7. Bakliyat ve Tahıl (krupy)
  {
    id: 'b1',
    name: 'Рис Османчик',
    price: 85,
    category: 'krupy',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Отборный рис сорта Османчик для приготовления вкуснейшего плова.'
  },
  {
    id: 'b3',
    name: 'Булгур для плова',
    price: 38,
    category: 'krupy',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Традиционный крупный булгур из твердых сортов пшеницы.'
  },

  // 9. Sos, Baharat ve Yağlar (specii)
  {
    id: 'b2',
    name: 'Оливковое масло Extra Virgin',
    price: 340,
    category: 'specii',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'литр',
    description: 'Оливковое масло первого холодного отжима премиального качества.'
  },

  // 8. Kuruyemiş ve Kuru Meyve (orehi)
  {
    id: 'b5',
    name: 'Мед высокогорный цветочный',
    price: 480,
    category: 'orehi',
    image: 'https://images.unsplash.com/photo-1528750994873-19f5a3c86b8e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'банка (1 кг)',
    description: '100% натуральный горный цветочный мед без добавок.'
  },

  // 15. Çay ve Kahve (chay_kofe)
  {
    id: 'b6',
    name: 'Чай черный листовой',
    price: 195,
    category: 'chay_kofe',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'пакет (1 кг)',
    description: 'Черный листовой чай первого сбора с насыщенным ароматом.'
  }
];
