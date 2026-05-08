# DragonBurger - Project Structure

## 📁 Complete Folder Structure

```
dragonburger8/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router pages
│   │   ├── 📁 admin/                   # Admin dashboard
│   │   │   ├── 📄 layout.tsx          # Admin layout with sidebar
│   │   ├── 📄 page.tsx            # Admin dashboard
│   │   ├── 📁 menu/               # Menu management
│   │   │   └── 📄 page.tsx        # CRUD for menu items
│   │   └── 📁 orders/             # Order management
│   │       └── 📄 page.tsx        # View and manage orders
│   ├── 📁 auth/                       # Authentication pages
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx        # Login page
│   │   └── 📁 signup/
│   │       └── 📄 page.tsx        # Registration page
│   ├── 📁 cart/                       # Shopping cart
│   │   └── 📄 page.tsx            # Cart and checkout
│   ├── 📁 checkout/                   # Payment processing
│   │   └── 📄 page.tsx            # Checkout with Telebirr
│   ├── 📁 kitchen/                    # Kitchen dashboard
│   │   └── 📄 page.tsx            # Real-time order management
│   ├── 📁 menu/                       # Customer menu
│   │   └── 📄 page.tsx            # Browse menu items
│   ├── 📄 globals.css                 # Global styles
│   ├── 📄 layout.tsx                 # Root layout
│   └── 📄 page.tsx                  # Homepage
│   ├── 📁 components/                  # Reusable React components
│   │   ├── 📄 Navbar.tsx             # Navigation bar
│   │   ├── 📄 Footer.tsx             # Footer component
│   │   ├── 📄 ClaudeAssistant.tsx    # AI assistant demo
│   │   └── 📄 ...                  # Other UI components
│   ├── 📁 contexts/                   # React contexts
│   │   └── 📄 AuthContext.tsx        # Authentication context
│   ├── 📁 lib/                        # Utility libraries
│   │   ├── 📄 supabase.ts           # Supabase client & types
│   │   ├── 📄 auth.ts               # Authentication functions
│   │   ├── 📄 telebirr.ts           # Telebirr payment integration
│   │   ├── 📄 posPrinter.ts          # POS printer functions
│   │   ├── 📄 claude.ts             # Claude AI integration
│   │   └── 📄 ...                  # Other utilities
│   └── 📁 store/                      # State management
│       └── 📄 cartStore.ts          # Zustand cart store
├── 📁 supabase/                        # Database setup
│   └── 📄 schema.sql               # Complete database schema
├── 📄 package.json                    # Dependencies & scripts
├── 📄 next.config.js                 # Next.js configuration
├── 📄 tailwind.config.js             # Tailwind CSS config
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 README.md                     # Project documentation
├── 📄 DEPLOYMENT.md                 # Deployment guide
├── 📄 PROJECT_STRUCTURE.md           # This file
└── 📄 .env.example                  # Environment variables template
```

## 🚀 Installation Commands

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Install Dependencies
```bash
# Clone the repository
git clone https://github.com/yourusername/dragonburger.git
cd dragonburger

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
# Supabase, Telebirr, etc.
```

## 🏃‍♂️ Run Commands

### Development
```bash
# Start development server
npm run dev
# or
yarn dev

# Access at: http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build
# or
yarn build

# Start production server
npm run start
# or
yarn start
```

### Code Quality
```bash
# Run linting
npm run lint
# or
yarn lint

# Type checking
npm run type-check
# or
yarn type-check
```

## 🌐 Vercel Deployment Steps

### 1. Prepare for Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### 2. Deploy to Vercel
```bash
# Deploy from project root
vercel --prod

# Follow prompts for:
# - Project linking
# - Environment variables
# - Domain configuration
```

### 3. Configure Environment Variables
In Vercel dashboard, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_TELEBIRR_APP_ID`
- `NEXT_PUBLIC_TELEBIRR_APP_KEY`
- `NEXT_PUBLIC_TELEBIRR_CALLBACK_URL`
- `NEXT_PUBLIC_TELEBIRR_RETURN_URL`

## 🗄️ Supabase Connection Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "DragonBurger"
3. Copy Project URL and Anon Key

### 2. Setup Database
```sql
-- Run the complete schema from supabase/schema.sql
-- This creates all tables, functions, and RLS policies
```

### 3. Enable Realtime
1. Go to Settings → Replication
2. Enable for tables:
   - `orders`
   - `order_items`
3. Add RLS policies (included in schema)

### 4. Configure Authentication
1. Settings → Authentication
2. Enable Email/Password auth
3. Set redirect URLs:
   - Site URL: `https://yourdomain.com`
   - Redirect URL: `https://yourdomain.com/auth/callback`

## 💳 Telebirr Integration Steps

### 1. Get Telebirr Credentials
1. Register at [telebirr.com](https://telebirr.com)
2. Apply for merchant account
3. Get App ID and App Key

### 2. Configure Webhooks
1. In Telebirr dashboard:
   - Callback URL: `https://yourdomain.com/api/telebirr-callback`
   - Return URL: `https://yourdomain.com/payment-confirmation`

### 3. Test Integration
```javascript
// Test payment initiation
import { initiateTelebirrPayment } from '@/lib/telebirr'

const result = await initiateTelebirrPayment({
  amount: 100.00,
  orderId: 'DB123456',
  customerPhone: '+251911123456',
  customerName: 'John Doe'
})
```

## 🎯 Key Features Implemented

### ✅ Customer Frontend
- [x] Beautiful homepage with hero section
- [x] Full menu with categories and search
- [x] Shopping cart with quantity management
- [x] Checkout with multiple payment methods
- [x] Telebirr mobile money integration
- [x] Mobile-responsive design
- [x] Dark modern UI with orange/red theme

### ✅ Admin Dashboard
- [x] Authentication and authorization
- [x] Real-time dashboard with statistics
- [x] Menu item CRUD operations
- [x] Order management and status updates
- [x] Customer database view
- [x] Analytics and reporting
- [x] Inventory tracking
- [x] Delivery driver management

### ✅ Kitchen Dashboard
- [x] Real-time order updates
- [x] Order status management
- [x] Sound notifications for new orders
- [x] Order preparation tracking
- [x] Ready for pickup management

### ✅ Payment Integration
- [x] Telebirr mobile money integration
- [x] Multiple payment methods support
- [x] Secure webhook handling
- [x] Payment status tracking
- [x] Refund processing

### ✅ POS Printer Support
- [x] Thermal receipt generation
- [x] Browser print functionality
- [x] Bluetooth printer support
- [x] Email receipt option
- [x] QR code generation

### ✅ Database & Backend
- [x] Complete Supabase schema
- [x] Row Level Security (RLS)
- [x] Real-time subscriptions
- [x] Database functions and triggers
- [x] Proper indexing for performance

### ✅ Technical Features
- [x] TypeScript for type safety
- [x] Tailwind CSS with custom theme
- [x] Framer Motion for animations
- [x] Zustand for state management
- [x] React Hot Toast for notifications
- [x] Mobile-first responsive design
- [x] SEO optimization
- [x] Performance optimization

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage

### Payment & Integration
- **Payment**: Telebirr Mobile Money
- **POS Printing**: Web Print API + Bluetooth
- **AI Assistant**: Claude Sonnet (Anthropic)

### Deployment & DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions (recommended)
- **Monitoring**: Error tracking ready
- **Analytics**: Google Analytics ready

## 🎨 Design System

### Colors
- **Primary**: Orange (#ff6b35)
- **Secondary**: Red (#ff0040)
- **Background**: Black (#000000)
- **Surface**: Dragon Gray (#1a1a1a)
- **Text**: White (#ffffff)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold weights
- **Body**: Regular weights
- **Code**: Monospace for receipts

### Components
- **Glassmorphism**: Cards with backdrop blur
- **Gradients**: Orange to red gradients
- **Animations**: Smooth transitions
- **Hover States**: Interactive feedback
- **Mobile**: Touch-friendly interfaces

## 📱 Mobile Optimization

### Responsive Design
- **Mobile-first**: Design for mobile first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch**: Large touch targets
- **Performance**: Optimized for mobile networks

### PWA Ready
- **Manifest**: Configurable
- **Service Worker**: Caching strategy
- **Offline**: Basic offline support
- **Install**: Add to home screen

## 🔒 Security Features

### Authentication
- **JWT**: Secure token-based auth
- **RLS**: Row Level Security
- **Roles**: Admin, Staff, Customer, Driver
- **Sessions**: Secure session management

### Data Protection
- **Encryption**: HTTPS everywhere
- **Validation**: Input sanitization
- **SQL Injection**: Parameterized queries
- **XSS**: Content Security Policy

### Payment Security
- **Webhooks**: Signature verification
- **PCI**: Compliance ready
- **Data**: Sensitive data protection
- **Audit**: Payment logging

## 📊 Analytics & Monitoring

### User Analytics
- **Orders**: Conversion tracking
- **Revenue**: Financial metrics
- **Users**: Registration and retention
- **Performance**: Page load times

### Error Tracking
- **Client**: JavaScript errors
- **Server**: API error logging
- **Performance**: Database query times
- **User**: Error reporting

---

**🎉 DragonBurger is now a complete, production-ready restaurant management system!**

All major features have been implemented with modern web development best practices, scalable architecture, and comprehensive documentation.
