'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-dragon-gray to-black">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                DragonBurger
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience legendary taste of our dragon-inspired burgers. 
              Premium ingredients, bold flavors, and unforgettable dining experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Order Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">50K+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">100+</div>
              <div className="text-gray-400">Dragon Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">4.9★</div>
              <div className="text-gray-400">Customer Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Burgers Section */}
      <section className="py-20 bg-dragon-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Signature
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                {" "}Dragon Burgers
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Handcrafted with finest ingredients and our secret dragon sauce
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Classic Dragon",
                price: "$12.99",
                description: "Our signature flame-grilled burger with dragon sauce",
                features: ["Double patty", "Dragon sauce", "Premium beef"],
                image: "/api/placeholder/400/300"
              },
              {
                name: "Spicy Dragon",
                price: "$14.99",
                description: "Fiery hot burger for brave souls",
                features: ["Ghost pepper", "Jalapeños", "Spicy dragon sauce"],
                image: "/api/placeholder/400/300"
              },
              {
                name: "Veggie Dragon",
                price: "$11.99",
                description: "Plant-based dragon burger with all the flavor",
                features: ["Beyond meat", "Fresh vegetables", "Dragon sauce"],
                image: "/api/placeholder/400/300"
              }
            ].map((burger, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative bg-dragon-black rounded-2xl overflow-hidden border border-orange-900/20 hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-900/20 to-red-900/20 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🍔</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-500 transition-colors">
                      {burger.name}
                    </h3>
                    <span className="text-2xl font-bold text-orange-500">
                      {burger.price}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{burger.description}</p>
                  <ul className="space-y-2 mb-6">
                    {burger.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/menu"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  >
                    Order Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                {" "}DragonBurger
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="w-8 h-8" />,
                title: "Premium Quality",
                description: "Only the finest ingredients make it to our dragon kitchen"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Fast Delivery",
                description: "Hot and fresh dragons delivered to your doorstep"
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Local Favorite",
                description: "Serving our community with love and passion"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-dragon-gray rounded-2xl border border-orange-900/20 hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-900/20 to-red-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Taste
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                {" "}Dragon Fire?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Order now and get 10% off your first dragon meal
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Explore Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
