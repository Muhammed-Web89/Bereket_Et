import { Product } from './types';

export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  colorClass: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'meat', name: 'Мясо и мясная продукция', emoji: '🥩', colorClass: 'bg-red-500 text-white' },
  { id: 'fish', name: 'Рыба и морепродукты', emoji: '🐟', colorClass: 'bg-sky-500 text-white' },
  { id: 'dairy', name: 'Молочная продукция', emoji: '🥛', colorClass: 'bg-blue-400 text-white' },
  { id: 'baby', name: 'Детское питание', emoji: '👶', colorClass: 'bg-emerald-400 text-white' },
  { id: 'semi_finished', name: 'Полуфабрикаты', emoji: '🍜', colorClass: 'bg-amber-600 text-white' },
  { id: 'canned', name: 'Консервы', emoji: '🥫', colorClass: 'bg-orange-500 text-white' },
  { id: 'grains', name: 'Крупы и бобовые', emoji: '🌾', colorClass: 'bg-yellow-600 text-white' },
  { id: 'nuts', name: 'Орехи и сухофрукты', emoji: '🥜', colorClass: 'bg-amber-700 text-white' },
  { id: 'spices', name: 'Приправы, специи и соусы', emoji: '🧂', colorClass: 'bg-stone-500 text-white' },
  { id: 'chocolate', name: 'Шоколад', emoji: '🍫', colorClass: 'bg-amber-900 text-white' },
  { id: 'candy', name: 'Конфеты', emoji: '🍬', colorClass: 'bg-pink-400 text-white' },
  { id: 'caramel', name: 'Карамель', emoji: '🍭', colorClass: 'bg-rose-450 text-white' },
  { id: 'bakery', name: 'Кондитерские изделия и выпечка', emoji: '🧁', colorClass: 'bg-fuchsia-500 text-white' },
  { id: 'beverages', name: 'Напитки', emoji: '🧃', colorClass: 'bg-teal-500 text-white' },
  { id: 'tea_coffee', name: 'Чай и кофе', emoji: '🍵', colorClass: 'bg-emerald-600 text-white' },
  { id: 'household_chem', name: 'Бытовая химия', emoji: '🧼', colorClass: 'bg-cyan-500 text-white' },
  { id: 'household_goods', name: 'Хозяйственные товары', emoji: '🏠', colorClass: 'bg-indigo-500 text-white' },
  { id: 'other', name: 'Прочее', emoji: '📦', colorClass: 'bg-slate-500 text-white' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Мясо и мясная продукция (meat)
  {
    id: 'k1',
    name: 'Гуляш говяжий (мякоть)',
    price: 520,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Свежая отборная говядина отечественного производства без костей, идеально подходит для тушения.'
  },
  {
    id: 'k2',
    name: 'Фарш говяжий домашний',
    price: 480,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1588168333986-5079a17a080e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Натуральный охлажденный фарш из говяжьей лопатки и грудинки для котлет и тефтелей.'
  },
  {
    id: 'k3',
    name: 'Каре ягненка (пирзола)',
    price: 680,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1602847213180-50e43a80eeef?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Нежнейшие порционные ребрышки молодого барашка. Идеально для жарки на гриле или сковороде.'
  },
  {
    id: 'k4',
    name: 'Котлеты классические',
    price: 450,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Готовые сочные котлеты из говядины по нашему особому семейному рецепту со специями.'
  },
  {
    id: 'k5',
    name: 'Антрекот говяжий (стейк)',
    price: 720,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Мраморное сочное мясо на кости, вырезанное из спинной части. Классика для ценителей стейков.'
  },
  {
    id: 'k6',
    name: 'Филе бедра куриного (без кости)',
    price: 180,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Охлажденное бескостное куриное мясо бедра. Отлично для запекания, шашлыка или жарки.'
  },

  // 3. Молочная продукция (dairy)
  {
    id: 'b4',
    name: 'Семья Йогурт (Сузьма)',
    price: 95,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'ведро (1.5кг)',
    description: 'Густой фермерский процеженный йогурт традиционного приготовления. Без добавок.'
  },

  // 7. Крупы и бобовые (grains)
  {
    id: 'b1',
    name: 'Рис Османчик (длиннозерный)',
    price: 85,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Отборный длиннозерный полупрозрачный рис. Идеально разваривается, сохраняя форму для плова.'
  },
  {
    id: 'b3',
    name: 'Булгур крупный (для плова)',
    price: 38,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'кг',
    description: 'Традиционный булгур крупного помола из твердых сортов пшеницы.'
  },

  // 9. Приправы, специи и соусы (spices)
  {
    id: 'b2',
    name: 'Оливковое масло Extra Virgin',
    price: 340,
    category: 'spices',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'л',
    description: 'Оливковое масло первого холодного отжима премиального качества, импортировано напрямую.'
  },

  // 8. Орехи и сухофрукты (nuts)
  {
    id: 'b5',
    name: 'Мед высокогорный цветочный',
    price: 480,
    category: 'nuts',
    image: 'https://images.unsplash.com/photo-1528750994873-19f5a3c86b8e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'банка (1кг)',
    description: '100% чистый натуральный мед, собранный дикими пчелами на горных лугах.'
  },

  // 15. Чай и кофе (tea_coffee)
  {
    id: 'b6',
    name: 'Чай черный листовой',
    price: 195,
    category: 'tea_coffee',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    unit: 'упак (1кг)',
    description: 'Черный чай первого сбора с насыщенным бархатистым вкусом и ярким ароматом.'
  }
];
