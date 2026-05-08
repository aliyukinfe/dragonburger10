-- DragonBurger Restaurant Management System Schema
-- Create all tables with proper relationships and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE TABLE IF NOT EXISTS public.categories (
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
CREATE TABLE IF NOT EXISTS public.menu_items (
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
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  preferred_payment_method TEXT DEFAULT 'telebirr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery drivers table
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  license_number TEXT,
  vehicle_type TEXT,
  vehicle_number TEXT,
  is_available BOOLEAN DEFAULT true,
  current_location JSONB,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  driver_id UUID REFERENCES public.delivery_drivers(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
  order_type TEXT CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')) DEFAULT 'takeaway',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  delivery_address TEXT,
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method TEXT CHECK (payment_method IN ('telebirr', 'cash', 'card', 'mobile_banking')) DEFAULT 'telebirr',
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,
  payment_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ingredient_name TEXT NOT NULL UNIQUE,
  current_stock DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- kg, liters, pieces, etc.
  minimum_stock DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu item ingredients (for inventory tracking)
CREATE TABLE IF NOT EXISTS public.menu_item_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  quantity_needed DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account status table (keeping existing)
CREATE TABLE IF NOT EXISTS public.account_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean DEFAULT true NOT NULL,
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  deactivated_at timestamptz,
  deactivated_reason text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.account_status (is_active, activated_at)
VALUES (true, now())
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Row Level Security (RLS) Policies
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
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Categories policies (public read, admin write)
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Menu items policies (public read, admin write)
CREATE POLICY "Public can view available menu items" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders policies
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Staff can view all orders" ON public.orders FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Staff can view all order items" ON public.order_items FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Payments policies
CREATE POLICY "Customers can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Inventory policies (staff/admin only)
CREATE POLICY "Staff can view inventory" ON public.inventory FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Account status policies
CREATE POLICY "Authenticated can read account status" ON public.account_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage account status" ON public.account_status FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for automatic order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_date TEXT := TO_CHAR(NOW(), 'YYMMDD');
  sequence_num TEXT;
BEGIN
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') 
  INTO sequence_num 
  FROM public.orders 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  RETURN 'DB' || order_date || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update total order amount
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders 
  SET 
    subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM public.order_items WHERE order_id = NEW.order_id),
    total_amount = subtotal + tax + delivery_fee - discount,
    updated_at = NOW()
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_order_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_drivers_updated_at BEFORE UPDATE ON public.delivery_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, description, sort_order) VALUES
('Burgers', 'Our signature dragon burgers', 1),
('Sides', 'Perfect companions to your meal', 2),
('Drinks', 'Refreshing beverages', 3),
('Desserts', 'Sweet endings', 4),
('Salads', 'Fresh and healthy options', 5)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO public.menu_items (category_id, name, description, price, is_spicy, is_vegetarian, sort_order) VALUES
((SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), 'Dragon Burger', 'Our signature flame-grilled burger with dragon sauce', 12.99, false, false, 1),
((SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), 'Spicy Dragon', 'Fiery hot burger for the brave', 14.99, true, false, 2),
((SELECT id FROM public.categories WHERE name = 'Burgers' LIMIT 1), 'Veggie Dragon', 'Plant-based dragon burger', 11.99, false, true, 3),
((SELECT id FROM public.categories WHERE name = 'Sides' LIMIT 1), 'Dragon Fries', 'Crispy golden fries with dragon seasoning', 3.99, false, true, 1),
((SELECT id FROM public.categories WHERE name = 'Sides' LIMIT 1), 'Dragon Wings', 'Spicy chicken wings', 8.99, true, false, 2),
((SELECT id FROM public.categories WHERE name = 'Drinks' LIMIT 1), 'Dragon Cola', 'Our signature cola', 2.99, false, true, 1),
((SELECT id FROM public.categories WHERE name = 'Drinks' LIMIT 1), 'Dragon Shake', 'Thick milkshake', 5.99, false, true, 2)
ON CONFLICT DO NOTHING;

-- Enable Realtime for orders and order_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
