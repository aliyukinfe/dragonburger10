export const SAMPLE_CATEGORIES = [
  { id: 'cat-burgers', name: 'Burgers', description: 'Signature dragon burgers', sort_order: 1, is_active: true },
  { id: 'cat-chicken', name: 'Fried Chicken', description: 'Crispy fried chicken', sort_order: 2, is_active: true },
  { id: 'cat-pizza', name: 'Pizza', description: 'Stone-baked pizzas', sort_order: 3, is_active: true },
  { id: 'cat-drinks', name: 'Drinks', description: 'Refreshing beverages', sort_order: 4, is_active: true },
  { id: 'cat-noodles', name: 'Noodles', description: 'Asian-style noodles', sort_order: 5, is_active: true },
  { id: 'cat-rice', name: 'Rice', description: 'Rice dishes', sort_order: 6, is_active: true },
  { id: 'cat-desserts', name: 'Desserts', description: 'Sweet endings', sort_order: 7, is_active: true },
]

export const CATEGORY_META: Record<string, { emoji: string; zh: string; color: string }> = {
  'Burgers':       { emoji: '🍔', zh: '汉堡', color: '#dc2626' },
  'Fried Chicken': { emoji: '🍗', zh: '炸鸡', color: '#d97706' },
  'Pizza':         { emoji: '🍕', zh: '比萨', color: '#b45309' },
  'Drinks':        { emoji: '🥤', zh: '饮品', color: '#0891b2' },
  'Noodles':       { emoji: '🍜', zh: '面条', color: '#7c3aed' },
  'Rice':          { emoji: '🍚', zh: '米饭', color: '#059669' },
  'Desserts':      { emoji: '🍰', zh: '甜品', color: '#db2777' },
}

export interface SampleMenuItem {
  id: string
  category_id: string
  name: string
  name_zh: string
  description: string
  price: number
  image_url?: string
  is_spicy: boolean
  spice_level?: 1 | 2 | 3
  is_vegetarian: boolean
  is_available: boolean
  is_popular: boolean
  is_new: boolean
  is_recommended: boolean
  preparation_time: number
  sort_order: number
  combo_items?: string[]
  addon_options?: { name: string; price: number }[]
}

export const SAMPLE_MENU_ITEMS: SampleMenuItem[] = [
  /* BURGERS */
  {
    id: 'burger-1', category_id: 'cat-burgers',
    name: 'Dragon Classic Burger', name_zh: '龙堡经典汉堡',
    description: 'Double wagyu beef patty, dragon sauce, aged cheddar, caramelized onions',
    price: 58, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 12, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  },
  {
    id: 'burger-2', category_id: 'cat-burgers',
    name: 'Fire Dragon Spicy Burger', name_zh: '火龙辣堡',
    description: 'Ghost pepper sauce, jalapeños, pepper jack cheese, crispy onion rings',
    price: 68, is_spicy: true, spice_level: 3, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: false, preparation_time: 15, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop',
  },
  {
    id: 'burger-3', category_id: 'cat-burgers',
    name: 'Gold Dragon Truffle Burger', name_zh: '金龙松露汉堡',
    description: 'Black truffle mayo, foie gras, gold leaf, premium A5 wagyu',
    price: 128, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: true, is_recommended: true, preparation_time: 18, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&h=200&fit=crop',
  },
  {
    id: 'burger-4', category_id: 'cat-burgers',
    name: 'Veggie Dragon Burger', name_zh: '素食龙堡',
    description: 'Beyond meat patty, avocado, sun-dried tomatoes, basil aioli',
    price: 48, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 10, sort_order: 4,
    image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&h=200&fit=crop',
  },
  {
    id: 'burger-5', category_id: 'cat-burgers',
    name: 'Dragon Combo Meal', name_zh: '龙堡套餐',
    description: 'Classic Dragon Burger + Dragon Fries + Dragon Cola',
    price: 78, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 15, sort_order: 5,
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&h=200&fit=crop',
    combo_items: ['Dragon Classic Burger', 'Dragon Fries', 'Dragon Cola'],
  },

  /* FRIED CHICKEN */
  {
    id: 'chicken-1', category_id: 'cat-chicken',
    name: 'Dragon Crispy Chicken', name_zh: '脆皮炸鸡',
    description: '24-hour marinated, double-fried chicken with secret spice blend',
    price: 45, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 10, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=200&h=200&fit=crop',
  },
  {
    id: 'chicken-2', category_id: 'cat-chicken',
    name: 'Szechuan Fire Wings', name_zh: '四川辣翅',
    description: 'Szechuan peppercorn glaze, crispy basil, numbing spice sauce',
    price: 52, is_spicy: true, spice_level: 2, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: false, preparation_time: 12, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&h=200&fit=crop',
  },
  {
    id: 'chicken-3', category_id: 'cat-chicken',
    name: 'Chicken Strips Box', name_zh: '鸡柳盒',
    description: 'Tender chicken strips, honey mustard, BBQ sauce, coleslaw',
    price: 42, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 10, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop',
  },
  {
    id: 'chicken-4', category_id: 'cat-chicken',
    name: 'Korean Fried Chicken', name_zh: '韩式炸鸡',
    description: 'Sweet gochujang glaze, sesame seeds, pickled radish',
    price: 58, is_spicy: true, spice_level: 1, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: true, is_recommended: false, preparation_time: 14, sort_order: 4,
    image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=200&h=200&fit=crop',
  },

  /* PIZZA */
  {
    id: 'pizza-1', category_id: 'cat-pizza',
    name: 'Dragon Fire Pizza', name_zh: '龙火比萨',
    description: 'Spicy nduja, mozzarella, San Marzano tomatoes, fresh basil',
    price: 88, is_spicy: true, spice_level: 2, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 20, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop',
  },
  {
    id: 'pizza-2', category_id: 'cat-pizza',
    name: 'Gold Dragon BBQ Pizza', name_zh: '金龙BBQ比萨',
    description: 'Pulled pork, caramelized onions, gold BBQ sauce, smoked gouda',
    price: 95, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 22, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  },
  {
    id: 'pizza-3', category_id: 'cat-pizza',
    name: 'Veggie Dragon Pizza', name_zh: '素食龙比萨',
    description: 'Roasted peppers, zucchini, portobello, truffle oil, vegan cheese',
    price: 78, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 18, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=200&h=200&fit=crop',
  },

  /* DRINKS */
  {
    id: 'drink-1', category_id: 'cat-drinks',
    name: 'Dragon Cola', name_zh: '龙可乐',
    description: 'Signature dragon-infused cola with a hint of ginger',
    price: 18, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: true, is_new: false, is_recommended: false, preparation_time: 2, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop',
  },
  {
    id: 'drink-2', category_id: 'cat-drinks',
    name: 'Dragon Milk Tea', name_zh: '龙珠奶茶',
    description: 'Premium Taiwan-style milk tea with tapioca pearls',
    price: 28, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 5, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
  },
  {
    id: 'drink-3', category_id: 'cat-drinks',
    name: 'Mango Dragon Shake', name_zh: '芒果龙沙冰',
    description: 'Fresh Alphonso mango, vanilla ice cream, dragon fruit swirl',
    price: 38, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: true, is_recommended: false, preparation_time: 5, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop',
  },
  {
    id: 'drink-4', category_id: 'cat-drinks',
    name: 'Gold Lemon Tea', name_zh: '金柠茶',
    description: 'Fresh lemon, honey, green tea, gold dust garnish',
    price: 22, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 3, sort_order: 4,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
  },

  /* NOODLES */
  {
    id: 'noodle-1', category_id: 'cat-noodles',
    name: 'Dragon Ramen', name_zh: '龙汤拉面',
    description: '18-hour tonkotsu broth, chashu pork, soft egg, nori, bamboo shoots',
    price: 68, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 15, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop',
  },
  {
    id: 'noodle-2', category_id: 'cat-noodles',
    name: 'Spicy Szechuan Noodles', name_zh: '四川红油面',
    description: 'Szechuan chili oil, minced pork, preserved vegetables, numbing spice',
    price: 55, is_spicy: true, spice_level: 3, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: false, preparation_time: 12, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop',
  },
  {
    id: 'noodle-3', category_id: 'cat-noodles',
    name: 'Pad Thai Dragon', name_zh: '泰式龙炒面',
    description: 'Wok-fried rice noodles, shrimp, tofu, bean sprouts, tamarind sauce',
    price: 62, is_spicy: true, spice_level: 1, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 12, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=200&h=200&fit=crop',
  },

  /* RICE */
  {
    id: 'rice-1', category_id: 'cat-rice',
    name: 'Dragon Fried Rice', name_zh: '龙炒饭',
    description: 'Wok-tossed jasmine rice, char siu pork, egg, green onions, soy sauce',
    price: 48, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 10, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop',
  },
  {
    id: 'rice-2', category_id: 'cat-rice',
    name: 'Teriyaki Chicken Rice', name_zh: '照烧鸡饭',
    description: 'Glazed teriyaki chicken, steamed rice, pickled ginger, sesame',
    price: 52, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 12, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop',
  },
  {
    id: 'rice-3', category_id: 'cat-rice',
    name: 'Yang Chow Fried Rice', name_zh: '扬州炒饭',
    description: 'Classic Yangzhou style, shrimp, BBQ pork, peas, carrots, egg',
    price: 45, is_spicy: false, is_vegetarian: false, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 10, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop',
  },

  /* DESSERTS */
  {
    id: 'dessert-1', category_id: 'cat-desserts',
    name: 'Dragon Egg Tart', name_zh: '龙蛋挞',
    description: 'Crispy pastry shell, silky egg custard, gold leaf flake',
    price: 25, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: true, is_new: false, is_recommended: true, preparation_time: 5, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop',
  },
  {
    id: 'dessert-2', category_id: 'cat-desserts',
    name: 'Matcha Dragon Cake', name_zh: '抹茶龙蛋糕',
    description: 'Premium Uji matcha, white chocolate ganache, red bean paste',
    price: 38, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: true, is_recommended: false, preparation_time: 5, sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop',
  },
  {
    id: 'dessert-3', category_id: 'cat-desserts',
    name: 'Mango Sticky Rice', name_zh: '芒果糯米饭',
    description: 'Thai sticky rice, fresh Alphonso mango, coconut cream, sesame',
    price: 32, is_spicy: false, is_vegetarian: true, is_available: true,
    is_popular: false, is_new: false, is_recommended: false, preparation_time: 5, sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1561409106-be09f8faecfa?w=200&h=200&fit=crop',
  },
]
