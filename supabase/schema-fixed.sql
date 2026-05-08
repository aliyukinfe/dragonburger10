-- DragonBurger Restaurant Management System Schema (Fixed)
-- Create all tables with proper relationships and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist with wrong schema
DROP TABLE IF EXISTS public.menu_item_ingredients CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('admin', 'staff', 'customer', 'driver')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  ingredients TEXT[],
  allergens TEXT[],
  is_spicy BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table (extends profiles for customer-specific info)
CREATE TABLE public.customers (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Ethiopia',
  delivery_notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery drivers table
CREATE TABLE public.delivery_drivers (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  license_number TEXT,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  is_available BOOLEAN DEFAULT true,
  current_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
  order_type TEXT CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')) DEFAULT 'takeaway',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  delivery_address TEXT,
  estimated_time INTEGER, -- in minutes
  driver_id UUID REFERENCES public.delivery_drivers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method TEXT CHECK (payment_method IN ('telebirr', 'cash', 'card', 'mobile_banking')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  payment_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ingredient_name TEXT NOT NULL UNIQUE,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg', -- kg, liters, pieces, etc.
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu item ingredients (for inventory tracking)
CREATE TABLE public.menu_item_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  quantity_needed DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account status table for order sequence
CREATE TABLE public.account_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_sequence INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_categories_active ON public.categories(is_active);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON public.order_items(menu_item_id);
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_inventory_name ON public.inventory(ingredient_name);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_status ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Menu items policies (public read available items, admin write)
CREATE POLICY "Anyone can view available menu items" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Customers policies
CREATE POLICY "Users can view own customer info" ON public.customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own customer info" ON public.customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Delivery drivers policies
CREATE POLICY "Drivers can view own info" ON public.delivery_drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers can update own availability" ON public.delivery_drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage drivers" ON public.delivery_drivers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Staff can view all orders" ON public.orders FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Staff can view all order items" ON public.order_items FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Inventory policies (staff/admin only)
CREATE POLICY "Staff can view inventory" ON public.inventory FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Menu item ingredients policies
CREATE POLICY "Staff can view menu item ingredients" ON public.menu_item_ingredients FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage menu item ingredients" ON public.menu_item_ingredients FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Account status policies
CREATE POLICY "Authenticated can read account status" ON public.account_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage account status" ON public.account_status FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_drivers_updated_at BEFORE UPDATE ON public.delivery_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  -- Get and increment order sequence
  UPDATE public.account_status 
  SET order_sequence = order_sequence + 1 
  WHERE id = (SELECT id FROM public.account_status LIMIT 1)
  RETURNING order_sequence INTO new_number;
  
  RETURN 'DB' || new_number;
END;
$$ LANGUAGE plpgsql;

-- Insert default account status
INSERT INTO public.account_status (order_sequence) VALUES (1000)
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description, sort_order) VALUES
('Burgers', 'Our signature dragon burgers', 1),
('Sides', 'Delicious side dishes', 2),
('Drinks', 'Refreshing beverages', 3),
('Desserts', 'Sweet endings', 4)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category_id, ingredients, is_spicy, is_vegetarian, is_available, preparation_time, sort_order) VALUES
('Classic Dragon', 'Our signature flame-grilled burger with dragon sauce', 12.99, (SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), ARRAY['Beef patty', 'Lettuce', 'Tomato', 'Dragon sauce'], false, false, true, 15, 1),
('Spicy Dragon', 'Fiery hot burger for the brave souls', 14.99, (SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), ARRAY['Beef patty', 'Ghost pepper', 'Jalapeños', 'Dragon sauce'], true, false, true, 20, 2),
('Veggie Dragon', 'Plant-based dragon burger with all the flavor', 11.99, (SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), ARRAY['Beyond meat patty', 'Lettuce', 'Tomato', 'Dragon sauce'], false, true, true, 12, 3),
('Dragon Fries', 'Crispy golden fries with dragon seasoning', 4.99, (SELECT id FROM public.categories WHERE name = 'Sides' LIMIT 1), ARRAY['Potatoes', 'Dragon seasoning', 'Salt'], false, true, true, 8, 1),
('Dragon Wings', 'Spicy chicken wings with dragon sauce', 8.99, (SELECT id FROM public.categories WHERE name = 'Sides' LIMIT 1), ARRAY['Chicken wings', 'Dragon sauce', 'Spices'], true, false, true, 18, 2),
('Dragon Cola', 'Refreshing cola with dragon twist', 2.99, (SELECT id FROM public.categories WHERE name = 'Drinks' LIMIT 1), ARRAY['Cola', 'Dragon flavor'], false, true, true, 2, 1),
('Dragon Shake', 'Thick milkshake with dragon flavor', 5.99, (SELECT id FROM public.categories WHERE name = 'Drinks' LIMIT 1), ARRAY['Ice cream', 'Milk', 'Dragon syrup'], false, true, true, 5, 2)
ON CONFLICT DO NOTHING;

-- Enable Realtime for orders and order_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
