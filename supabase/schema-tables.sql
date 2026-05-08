-- DragonBurger: Tables + QR + Extended Schema
-- Run AFTER schema.sql

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number TEXT NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  current_order_id UUID REFERENCES public.orders(id),
  qr_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table_number column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.restaurant_tables(id);

-- Restaurant Settings
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add popular/new/recommended flags to menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS name_zh TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS spice_level INTEGER DEFAULT 0;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS combo_items TEXT[];

-- Add spice_level to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS spice_level INTEGER DEFAULT 0;

-- Extend categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_zh TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT;

-- RLS for restaurant_tables
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active tables" ON public.restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tables" ON public.restaurant_tables FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS for restaurant_settings
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view settings" ON public.restaurant_settings FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage settings" ON public.restaurant_settings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Public policy for menu_items (unauthenticated ordering)
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Anyone can view available menu items" ON public.menu_items FOR SELECT USING (true);

-- Public policy for categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (true);

-- Allow anonymous order insertion (QR ordering without login)
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Staff can manage all orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Allow anonymous order_items insertion
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);

-- Realtime for kitchen/waiter
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_settings;

-- Sample tables data
INSERT INTO public.restaurant_tables (table_number, capacity, location) VALUES
('1', 2, '一楼'), ('2', 2, '一楼'), ('3', 4, '一楼'), ('4', 4, '一楼'),
('5', 4, '二楼'), ('6', 4, '二楼'), ('7', 6, '二楼'), ('8', 6, '二楼'),
('VIP1', 8, 'VIP包厢'), ('VIP2', 10, 'VIP包厢')
ON CONFLICT (table_number) DO NOTHING;

-- Update existing categories with Chinese names and emojis
UPDATE public.categories SET emoji = '🍔', name_zh = '汉堡' WHERE name = 'Burgers';
UPDATE public.categories SET emoji = '🍟', name_zh = '小食' WHERE name = 'Sides';
UPDATE public.categories SET emoji = '🥤', name_zh = '饮品' WHERE name = 'Drinks';
UPDATE public.categories SET emoji = '🍰', name_zh = '甜品' WHERE name = 'Desserts';
UPDATE public.categories SET emoji = '🥗', name_zh = '沙拉' WHERE name = 'Salads';

-- Insert extra categories
INSERT INTO public.categories (name, name_zh, emoji, description, sort_order) VALUES
('Fried Chicken', '炸鸡', '🍗', 'Crispy fried chicken', 2),
('Pizza', '比萨', '🍕', 'Stone-baked pizzas', 3),
('Noodles', '面条', '🍜', 'Asian noodles', 5),
('Rice', '米饭', '🍚', 'Rice dishes', 6)
ON CONFLICT DO NOTHING;

-- Default restaurant settings
INSERT INTO public.restaurant_settings (key, value) VALUES
('restaurant_name', '"DragonBurger"'),
('restaurant_name_zh', '"龙堡餐厅"'),
('tax_rate', '0.05'),
('currency', '"CNY"'),
('currency_symbol', '"¥"'),
('default_lang', '"zh"'),
('table_service_enabled', 'true'),
('kitchen_display_enabled', 'true'),
('sound_notifications', 'true'),
('receipt_printing', 'false')
ON CONFLICT (key) DO NOTHING;
