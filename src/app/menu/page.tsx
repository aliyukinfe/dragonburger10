'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, Minus, ShoppingCart, Star, Clock, Leaf, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  ingredients: string[]
  allergens: string[]
  is_spicy: boolean
  is_vegetarian: boolean
  is_available: boolean
  preparation_time: number
  category_id: string
  categories: {
    name: string
  }
}

interface Category {
  id: string
  name: string
  description: string
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem, items } = useCartStore()

  useEffect(() => {
    fetchMenuData()
  }, [])

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      // Fetch menu items with categories
      const { data: itemsData } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_available', true)
        .order('sort_order')

      if (categoriesData) setCategories(categoriesData)
      if (itemsData) setMenuItems(itemsData)
    } catch (error) {
      console.error('Error fetching menu data:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1
    })
    toast.success(`${item.name} added to cart`)
  }

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              {" "}Dragon Menu
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover our legendary dragon-inspired dishes crafted with premium ingredients
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dragon-gray border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-orange-500 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-dragon-gray border border-orange-900/20 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-dragon-gray rounded-2xl overflow-hidden border border-orange-900/20 hover:border-orange-500/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-900/20 to-red-900/20 flex items-center justify-center relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🍔</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.is_spicy && (
                    <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      <Flame className="w-3 h-3" />
                      <span>Spicy</span>
                    </div>
                  )}
                  {item.is_vegetarian && (
                    <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      <Leaf className="w-3 h-3" />
                      <span>Veg</span>
                    </div>
                  )}
                </div>

                {/* Preparation time */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.preparation_time} min</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.categories?.name}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-orange-500">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Ingredients preview */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-dragon-black px-2 py-1 rounded text-gray-300"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {item.ingredients.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{item.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="flex items-center justify-between">
                  {getItemQuantity(item.id) > 0 ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const currentQty = getItemQuantity(item.id)
                          if (currentQty > 1) {
                            // Update quantity logic would go here
                          } else {
                            // Remove item logic would go here
                          }
                        }}
                        className="p-2 bg-dragon-black rounded-lg hover:bg-dragon-light transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-semibold w-8 text-center">
                        {getItemQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 bg-dragon-black rounded-lg hover:bg-dragon-light transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
