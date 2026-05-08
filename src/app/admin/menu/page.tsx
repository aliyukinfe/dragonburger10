'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react'
import { Database } from '@/lib/supabase'
import toast from 'react-hot-toast'

type MenuItemRow = Database['public']['Tables']['menu_items']['Row']
type MenuItem = MenuItemRow & {
  categories: {
    name: string
  }
}

type Category = Database['public']['Tables']['categories']['Row']

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    ingredients: [] as string[],
    allergens: [] as string[],
    is_spicy: false,
    is_vegetarian: false,
    is_available: true,
    preparation_time: 15,
    sort_order: 0
  })

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
        .order('sort_order')

      if (categoriesData) setCategories(categoriesData)
      if (itemsData) setMenuItems(itemsData)
    } catch (error) {
      console.error('Error fetching menu data:', error)
      toast.error('Failed to load menu data')
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

  const handleAddItem = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          ...formData,
          price: parseFloat(formData.price),
          ingredients: formData.ingredients.filter(i => i.trim()),
          allergens: formData.allergens.filter(a => a.trim())
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Menu item added successfully!')
      setShowAddModal(false)
      resetForm()
      fetchMenuData()
    } catch (error) {
      console.error('Error adding menu item:', error)
      toast.error('Failed to add menu item')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...formData,
          price: parseFloat(formData.price),
          ingredients: formData.ingredients.filter(i => i.trim()),
          allergens: formData.allergens.filter(a => a.trim())
        })
        .eq('id', editingItem.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Menu item updated successfully!')
      setEditingItem(null)
      resetForm()
      fetchMenuData()
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error('Failed to update menu item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Menu item deleted successfully!')
      fetchMenuData()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Failed to delete menu item')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      ingredients: [],
      allergens: [],
      is_spicy: false,
      is_vegetarian: false,
      is_available: true,
      preparation_time: 15,
      sort_order: 0
    })
  }

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      is_spicy: item.is_spicy,
      is_vegetarian: item.is_vegetarian,
      is_available: item.is_available,
      preparation_time: item.preparation_time,
      sort_order: item.sort_order
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData(prev => ({ ...prev, ingredients: newIngredients }))
  }

  const addIngredient = () => {
    setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading menu items...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Menu Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
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

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dragon-gray rounded-xl border border-orange-900/20 overflow-hidden"
          >
            {/* Item Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-900/20 to-red-900/20 flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* Item Details */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.categories?.name}</p>
                </div>
                <span className="text-lg font-bold text-orange-500">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.is_spicy && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Spicy
                  </span>
                )}
                {item.is_vegetarian && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Vegetarian
                  </span>
                )}
                {!item.is_available && (
                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                    Unavailable
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dragon-gray rounded-2xl border border-orange-900/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Dragon Burger"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="12.99"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preparation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preparation Time (minutes)</label>
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Describe your delicious menu item..."
                />
              </div>

              {/* Ingredients */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Ingredients</label>
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-dragon-black border border-orange-900/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="e.g., Beef patty, Lettuce, Tomato"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full px-4 py-3 bg-dragon-black border border-orange-900/20 text-gray-300 rounded-lg hover:border-orange-500 transition-colors"
                  >
                    Add Ingredient
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_spicy"
                    checked={formData.is_spicy}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 bg-dragon-black border-orange-900/20 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Spicy</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 bg-dragon-black border-orange-900/20 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 bg-dragon-black border-orange-900/20 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Available</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-3 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-500 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Update' : 'Add'} Item</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
