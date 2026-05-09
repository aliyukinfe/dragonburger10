import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-neon-cyan/10">
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-surface/50 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-neon-orange to-neon-red rounded-xl flex items-center justify-center shadow-lg shadow-neon-orange/20">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-white font-bold text-lg">DragonBurger</span>
            </div>
            <p className="text-cyber-muted mb-5 max-w-md text-sm leading-relaxed">
              Experience the best burgers in town with our premium ingredients and dragon-inspired recipes.
              Quality, taste, and satisfaction guaranteed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5">
              {['Menu', 'About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((label) => (
                <li key={label}>
                  <Link href={`/${label.toLowerCase().replace(/ /g, '-')}`} className="text-cyber-muted hover:text-neon-cyan transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-cyber-muted text-sm">
                <MapPin className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <span>123 Dragon Street, Addis Ababa</span>
              </li>
              <li className="flex items-center space-x-2 text-cyber-muted text-sm">
                <Phone className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span>+251 911 123 456</span>
              </li>
              <li className="flex items-center space-x-2 text-cyber-muted text-sm">
                <Mail className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span>info@dragonburger.et</span>
              </li>
            </ul>

            <div className="mt-5">
              <h4 className="text-white font-semibold mb-2 text-xs tracking-wider uppercase">Hours</h4>
              <div className="text-cyber-muted text-xs space-y-1">
                <p>Mon - Thu: 11AM - 10PM</p>
                <p>Fri - Sat: 11AM - 11PM</p>
                <p>Sunday: 12PM - 9PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neon-cyan/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-cyber-muted text-xs">
              © 2024 DragonBurger. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-cyber-muted text-xs">Powered by</span>
              <span className="text-neon-cyan font-semibold text-xs">DragonTech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
