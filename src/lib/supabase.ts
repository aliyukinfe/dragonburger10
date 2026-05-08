import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          role: 'admin' | 'staff' | 'customer' | 'driver'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'staff' | 'customer' | 'driver'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'staff' | 'customer' | 'driver'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          ingredients: string[] | null
          allergens: string[] | null
          is_spicy: boolean
          is_vegetarian: boolean
          is_available: boolean
          sort_order: number
          preparation_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          is_spicy?: boolean
          is_vegetarian?: boolean
          is_available?: boolean
          sort_order?: number
          preparation_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          is_spicy?: boolean
          is_vegetarian?: boolean
          is_available?: boolean
          sort_order?: number
          preparation_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          address: string | null
          city: string | null
          postal_code: string | null
          loyalty_points: number
          total_orders: number
          total_spent: number
          preferred_payment_method: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          loyalty_points?: number
          total_orders?: number
          total_spent?: number
          preferred_payment_method?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          loyalty_points?: number
          total_orders?: number
          total_spent?: number
          preferred_payment_method?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          driver_id: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          order_type: 'dine_in' | 'takeaway' | 'delivery'
          subtotal: number
          tax: number
          delivery_fee: number
          discount: number
          total_amount: number
          special_instructions: string | null
          delivery_address: string | null
          estimated_time: number | null
          actual_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          driver_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          order_type?: 'dine_in' | 'takeaway' | 'delivery'
          subtotal: number
          tax?: number
          delivery_fee?: number
          discount?: number
          total_amount: number
          special_instructions?: string | null
          delivery_address?: string | null
          estimated_time?: number | null
          actual_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          driver_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          order_type?: 'dine_in' | 'takeaway' | 'delivery'
          subtotal?: number
          tax?: number
          delivery_fee?: number
          discount?: number
          total_amount?: number
          special_instructions?: string | null
          delivery_address?: string | null
          estimated_time?: number | null
          actual_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          total_price: number
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          special_instructions?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          payment_method: 'telebirr' | 'cash' | 'card' | 'mobile_banking'
          amount: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          transaction_id: string | null
          payment_response: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          payment_method?: 'telebirr' | 'cash' | 'card' | 'mobile_banking'
          amount: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string | null
          payment_response?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          payment_method?: 'telebirr' | 'cash' | 'card' | 'mobile_banking'
          amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string | null
          payment_response?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          ingredient_name: string
          current_stock: number
          unit: string
          minimum_stock: number
          unit_cost: number | null
          supplier: string | null
          last_restocked: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ingredient_name: string
          current_stock: number
          unit: string
          minimum_stock: number
          unit_cost?: number | null
          supplier?: string | null
          last_restocked?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ingredient_name?: string
          current_stock?: number
          unit?: string
          minimum_stock?: number
          unit_cost?: number | null
          supplier?: string | null
          last_restocked?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_drivers: {
        Row: {
          id: string
          license_number: string | null
          vehicle_type: string | null
          vehicle_number: string | null
          is_available: boolean
          current_location: any | null
          rating: number
          total_deliveries: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          license_number?: string | null
          vehicle_type?: string | null
          vehicle_number?: string | null
          is_available?: boolean
          current_location?: any | null
          rating?: number
          total_deliveries?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          license_number?: string | null
          vehicle_type?: string | null
          vehicle_number?: string | null
          is_available?: boolean
          current_location?: any | null
          rating?: number
          total_deliveries?: number
          created_at?: string
          updated_at?: string
        }
      }
      account_status: {
        Row: {
          id: string
          is_active: boolean
          activated_at: string
          expires_at: string | null
          deactivated_at: string | null
          deactivated_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          activated_at?: string
          expires_at?: string | null
          deactivated_at?: string | null
          deactivated_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          activated_at?: string
          expires_at?: string | null
          deactivated_at?: string | null
          deactivated_reason?: string | null
          created_at?: string
        }
      }
    }
  }
}
