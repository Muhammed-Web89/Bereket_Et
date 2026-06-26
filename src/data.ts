import { Product } from './types';

export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  colorClass: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'meat', name: 'Мясо и мясные продукты', emoji: '🥩', colorClass: 'bg-red-500 text-white' },
  { id: 'fish', name: 'Рыба и морепродукты', emoji: '🐟', colorClass: 'bg-sky-500 text-white' },
  { id: 'dairy', name: 'Молочные продукты', emoji: '🥛', colorClass: 'bg-blue-400 text-white' },
  { id: 'baby', name: 'Детское питание', emoji: '👶', colorClass: 'bg-emerald-400 text-white' },
  { id: 'semi_finished', name: 'Полуфабрикаты и готовые блюда', emoji: '🍜', colorClass: 'bg-amber-600 text-white' },
  { id: 'canned', name: 'Консервированные продукты', emoji: '🥫', colorClass: 'bg-orange-500 text-white' },
  { id: 'grains', name: 'Крупы и бакалея', emoji: '🌾', colorClass: 'bg-yellow-600 text-white' },
  { id: 'nuts', name: 'Орехи и сухофрукты', emoji: '🥜', colorClass: 'bg-amber-700 text-white' },
  { id: 'spices', name: 'Соусы, специи и масла', emoji: '🧂', colorClass: 'bg-stone-500 text-white' },
  { id: 'chocolate', name: 'Шоколад', emoji: '🍫', colorClass: 'bg-amber-900 text-white' },
  { id: 'candy', name: 'Сладости', emoji: '🍬', colorClass: 'bg-pink-400 text-white' },
  { id: 'caramel', name: 'Карамель', emoji: '🍭', colorClass: 'bg-rose-450 text-white' },
  { id: 'bakery', name: 'Выпечка и кондитерские изделия', emoji: '🧁', colorClass: 'bg-fuchsia-500 text-white' },
  { id: 'beverages', name: 'Напитки', emoji: '🧃', colorClass: 'bg-teal-500 text-white' },
  { id: 'tea_coffee', name: 'Чай и кофе', emoji: '🍵', colorClass: 'bg-emerald-600 text-white' },
  { id: 'household_chem', name: 'Бытовая химия и гигиена', emoji: '🧼', colorClass: 'bg-cyan-500 text-white' },
  { id: 'household_goods', name: 'Посуда и товары для дома', emoji: '🏠', colorClass: 'bg-indigo-500 text-white' },
  { id: 'other', name: 'Другое', emoji: '📦', colorClass: 'bg-slate-500 text-white' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Et ve Et Ürünleri (meat)
  {
    id: 'k1',
    name: 'Говядина для гуляша (кусочками)',
    price: 520,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Идеальное, свежее бескостное мясо говядины для ваших блюд.'
  },
  {
    id: 'k2',
    name: 'Фарш говяжий (особый)',
    price: 480,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1588168333986-5079a17a080e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежевыжатый качественный говяжий фарш для котлет и других блюд.'
  },
  {
    id: 'k3',
    name: 'Бараньи ребрышки (пирзола)',
    price: 680,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1602847213180-50e43a80eeef?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежие и нежные бараньи ребрышки, идеально подходящие для гриля или сковороды.'
  },
  {
    id: 'k4',
    name: 'Котлеты из говядины (мясницкие)',
    price: 450,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Сочные и вкусные готовые говяжьи котлеты, приготовленные по нашему особому рецепту со специями.'
  },
  {
    id: 'k5',
    name: 'Антрекот из говядины',
    price: 720,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Сочный и нежный антрекот из говядины для жарки на гриле.'
  },
  {
    id: 'k6',
    name: 'Куриное бедро (без кости)',
    price: 180,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежее куриное филе бедра без кости для запекания, шашлыка или жарки.'
  },

  // 3. Süt ve Süt Ürünleri (dairy)
  {
    id: 'b4',
    name: 'Йогурт Сузьма (процеженный)',
    price: 95,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'ведро (1.5 кг)',
    description: 'Густой натуральный процеженный йогурт традиционного приготовления. Без добавок.'
  },

  // 7. Bakliyat ve Tahıl (grains)
  {
    id: 'b1',
    name: 'Рис Османчик',
    price: 85,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Отборный рис сорта Османчик для приготовления вкуснейшего плова.'
  },
  {
    id: 'b3',
    name: 'Булгур для плова',
    price: 38,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Традиционный крупный булгур из твердых сортов пшеницы.'
  },

  // 9. Sos, Baharat ve Yağlar (spices)
  {
    id: 'b2',
    name: 'Оливковое масло Extra Virgin',
    price: 340,
    category: 'spices',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'литр',
    description: 'Оливковое масло первого холодного отжима премиального качества.'
  },

  // 8. Kuruyemiş ve Kuru Meyve (nuts)
  {
    id: 'b5',
    name: 'Мед высокогорный цветочный',
    price: 480,
    category: 'nuts',
    image: 'https://images.unsplash.com/photo-1528750994873-19f5a3c86b8e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'банка (1 кг)',
    description: '100% натуральный горный цветочный мед без добавок.'
  },

  // 15. Çay ve Kahve (tea_coffee)
  {
    id: 'b6',
    name: 'Чай черный листовой',
    price: 195,
    category: 'tea_coffee',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'пакет (1 кг)',
    description: 'Черный листовой чай первого сбора с насыщенным ароматом.'
  }
];
