'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Star, Clock, MapPin, Zap, Flame, Sparkles, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-neon-cyan rounded-full blur-[100px] opacity-20"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-10 right-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-neon-purple rounded-full blur-[100px] opacity-20"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-orange rounded-full blur-[120px] opacity-10"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center safe-top safe-bottom">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              <span className="text-neon-cyan text-xs font-semibold tracking-wider uppercase">Now Open</span>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-cyber-gradient neon-text-orange mt-1">
                DragonBurger
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-cyber-muted mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              Experience legendary taste with our dragon-inspired burgers.
              Premium ingredients, bold flavors, and an unforgettable dining experience.
            </p>

            {/* CTA Buttons - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
              <Link
                href="/order/1"
                className="touch-btn inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-neon-orange to-neon-red text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-neon-orange/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <Zap className="w-4 h-4" />
                QR Order / 扫码点餐
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/menu"
                className="touch-btn inline-flex items-center justify-center gap-2 px-6 py-4 glass text-neon-cyan font-semibold rounded-2xl hover:bg-neon-cyan/10 transition-all duration-300 border border-neon-cyan/30 active:scale-[0.98] text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4" />
                Browse Menu
              </Link>
            </div>
          </motion.div>

          {/* Stats - Horizontal scroll on mobile */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="whileInView"
            viewport={{ once: true }}
            className="mt-12 sm:mt-16"
          >
            <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto no-scrollbar sm:overflow-visible px-2">
              {[
                { value: '50K+', label: 'Happy Customers', icon: <Star className="w-4 h-4" /> },
                { value: '100+', label: 'Dragon Recipes', icon: <Flame className="w-4 h-4" /> },
                { value: '4.9★', label: 'Rating', icon: <Sparkles className="w-4 h-4" /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="cyber-card p-4 sm:p-6 text-center min-w-[140px] sm:min-w-0 flex-shrink-0"
                >
                  <div className="flex items-center justify-center gap-1 text-neon-cyan mb-1">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-cyber-muted mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <span className="text-neon-orange text-xs font-semibold tracking-wider uppercase">System</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              Scan <span className="text-neon-cyan">·</span> Order <span className="text-neon-cyan">·</span> Enjoy
            </h2>
            <p className="text-cyber-muted max-w-lg mx-auto text-sm sm:text-base">
              Real-time table ordering. Scan QR, pick items, pay — no app needed.
            </p>
          </motion.div>

          {/* Steps - Horizontal scroll snap on mobile */}
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
            className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto no-scrollbar scroll-snap-x sm:scroll-snap-none pb-2"
          >
            {[
              { step: '01', title: 'Scan QR', desc: 'Scan table QR with any phone camera', emoji: '📱' },
              { step: '02', title: 'Browse & Order', desc: 'Full menu with categories & spice levels', emoji: '🛒' },
              { step: '03', title: 'Track Live', desc: 'Real-time status from kitchen to table', emoji: '✅' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="gradient-border p-5 sm:p-6 text-center min-w-[260px] sm:min-w-0"
              >
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="text-neon-cyan text-xs font-bold tracking-wider mb-2">STEP {s.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-cyber-muted text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
            <Link
              href="/order/1"
              className="touch-btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-orange to-neon-red text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-neon-orange/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              Try Demo Table 1
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED BURGERS ===== */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Flame className="w-3 h-3 text-neon-orange" />
              <span className="text-neon-orange text-xs font-semibold tracking-wider uppercase">Menu</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-neon-red neon-text-orange">Dragon Burgers</span>
            </h2>
            <p className="text-cyber-muted max-w-lg mx-auto text-sm sm:text-base">
              Handcrafted with finest ingredients and our secret dragon sauce
            </p>
          </motion.div>

          {/* Burger cards - Horizontal scroll on mobile */}
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto no-scrollbar scroll-snap-x sm:scroll-snap-none pb-2"
          >
            {[
              { name: 'Classic Dragon', price: '$12.99', desc: 'Flame-grilled with dragon sauce', tags: ['Double patty', 'Premium beef'], emoji: '🍔' },
              { name: 'Spicy Dragon', price: '$14.99', desc: 'Fiery hot for brave souls', tags: ['Ghost pepper', 'Jalapeños'], emoji: '🌶️' },
              { name: 'Veggie Dragon', price: '$11.99', desc: 'Plant-based with full flavor', tags: ['Beyond meat', 'Fresh veg'], emoji: '🥬' },
            ].map((burger, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="cyber-card overflow-hidden min-w-[280px] sm:min-w-0 group"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-neon-orange/10 to-neon-red/10 flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neon-orange/20 to-neon-red/20 rounded-full flex items-center justify-center"
                  >
                    <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{burger.emoji}</span>
                  </motion.div>
                  <div className="absolute top-3 right-3 glass rounded-full px-3 py-1">
                    <span className="text-neon-orange font-bold text-sm">{burger.price}</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-neon-cyan transition-colors mb-1">
                    {burger.name}
                  </h3>
                  <p className="text-cyber-muted text-sm mb-3">{burger.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {burger.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded-full border border-neon-cyan/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/menu"
                    className="touch-btn w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-neon-orange to-neon-red text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-neon-orange/20 transition-all active:scale-[0.98] text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Order Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3 h-3 text-neon-purple" />
              <span className="text-neon-purple text-xs font-semibold tracking-wider uppercase">Features</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              Why Choose <span className="text-transparent bg-clip-text bg-neon-purple neon-text-purple">DragonBurger</span>
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { icon: <Star className="w-6 h-6" />, title: 'Premium Quality', desc: 'Only the finest ingredients make it to our kitchen', color: 'text-neon-orange' },
              { icon: <Clock className="w-6 h-6" />, title: 'Fast Service', desc: 'Hot and fresh orders delivered in record time', color: 'text-neon-cyan' },
              { icon: <MapPin className="w-6 h-6" />, title: 'Local Favorite', desc: 'Serving our community with love and passion', color: 'text-neon-purple' },
              { icon: <Zap className="w-6 h-6" />, title: 'QR Ordering', desc: 'Scan, order, and pay without any app download', color: 'text-neon-pink' },
              { icon: <Flame className="w-6 h-6" />, title: 'Live Kitchen', desc: 'Real-time order tracking from grill to table', color: 'text-neon-orange' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'Daily Fresh', desc: 'Every ingredient is prepared fresh each morning', color: 'text-neon-cyan' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="cyber-card p-5 sm:p-6 group hover:border-neon-cyan/30"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-cyber-muted text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/5 via-transparent to-neon-purple/5" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <div className="gradient-border p-8 sm:p-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Taste{' '}
                <span className="text-transparent bg-clip-text bg-cyber-gradient neon-text-orange">
                  Dragon Fire?
                </span>
              </h2>
              <p className="text-cyber-muted mb-8 text-sm sm:text-base max-w-md mx-auto">
                Order now and get <span className="text-neon-orange font-bold">10% off</span> your first dragon meal
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/menu"
                  className="touch-btn inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-orange to-neon-red text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-neon-orange/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Explore Menu
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/order/1"
                  className="touch-btn inline-flex items-center justify-center gap-2 px-8 py-4 glass text-neon-cyan font-semibold rounded-2xl hover:bg-neon-cyan/10 transition-all border border-neon-cyan/30 active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  Quick Order
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
