# DragonBurger - Deployment Guide

## Overview
DragonBurger is a complete restaurant management system built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Telebirr payment integration.

## Prerequisites

### Required Services
1. **Supabase Account** - Database and authentication
2. **Vercel Account** - Hosting and deployment
3. **Telebirr Merchant Account** - Payment processing
4. **GitHub Account** - Version control and deployment

### Development Tools
- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

## Step 1: Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dragonburger.git
cd dragonburger
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telebirr (Required for payments)
NEXT_PUBLIC_TELEBIRR_APP_ID=your_telebirr_app_id
NEXT_PUBLIC_TELEBIRR_APP_KEY=your_telebirr_app_key
NEXT_PUBLIC_TELEBIRR_BASE_URL=https://api.telebirr.com
NEXT_PUBLIC_TELEBIRR_CALLBACK_URL=https://yourdomain.com/api/telebirr-callback
NEXT_PUBLIC_TELEBIRR_RETURN_URL=https://yourdomain.com/payment-confirmation

# Claude AI (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Step 2: Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "DragonBurger"
3. Note your Project URL and anon key

### 2. Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the entire content from `supabase/schema.sql`
3. Click "Run" to execute all tables and functions

### 3. Enable Realtime
1. Go to Settings → Replication
2. Enable realtime for:
   - `orders` table
   - `order_items` table
3. Add RLS policies (included in schema)

### 4. Configure Authentication
1. Go to Settings → Authentication
2. Enable Email/Password authentication
3. Configure redirect URLs:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`

### 5. Create Admin User
```sql
-- Run this in Supabase SQL Editor
INSERT INTO auth.users (email, password_hash, role)
VALUES ('admin@dragonburger.et', 'hashed_password', 'admin');
```

## Step 3: Telebirr Payment Setup

### 1. Get Telebirr Credentials
1. Register at [telebirr.com](https://telebirr.com)
2. Apply for merchant account
3. Get your App ID and App Key

### 2. Configure Webhooks
1. In Telebirr dashboard, set callback URL:
   `https://yourdomain.com/api/telebirr-callback`
2. Configure return URL:
   `https://yourdomain.com/payment-confirmation`

### 3. Test Integration
Use the test environment first with test credentials before going live.

## Step 4: Local Development

### 1. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Access Application
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- Kitchen: http://localhost:3000/kitchen

### 3. Test Features
- User registration and login
- Menu browsing and cart
- Order placement with Telebirr
- Admin dashboard functionality
- Kitchen order management

## Step 5: GitHub Setup

### 1. Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit: DragonBurger restaurant management system"
git branch -M main
```

### 2. Create GitHub Repository
1. Go to GitHub and create new repository: "dragonburger"
2. Add remote:
```bash
git remote add origin https://github.com/yourusername/dragonburger.git
```

### 3. Push to GitHub
```bash
git push -u origin main
```

## Step 6: Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Project
```bash
vercel --prod
```

### 4. Configure Environment Variables in Vercel
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env.local` file

### 5. Configure Domains
1. In Vercel dashboard, go to Domains
2. Add your custom domain
3. Configure DNS records as provided by Vercel

## Step 7: Production Configuration

### 1. Database Migrations
Run any additional migrations needed for production data.

### 2. Performance Optimization
- Enable CDN for static assets
- Configure caching headers
- Optimize database queries

### 3. Security Setup
- Configure HTTPS (automatic with Vercel)
- Set up CORS properly
- Enable security headers

## Step 8: Testing Production

### 1. Full User Journey Test
1. User registration → Login
2. Browse menu → Add to cart
3. Checkout → Telebirr payment
4. Order confirmation → Email receipt
5. Kitchen order processing
6. Admin order management

### 2. Admin Functions Test
1. Menu item CRUD operations
2. Order management
3. Customer database
4. Analytics and reports

### 3. Payment Testing
1. Test successful payments
2. Test failed payments
3. Test webhook callbacks
4. Test refund scenarios

## Step 9: Monitoring and Maintenance

### 1. Error Monitoring
Set up error tracking (Sentry, LogRocket, etc.)

### 2. Analytics
- Google Analytics integration
- Custom event tracking
- Conversion tracking

### 3. Backup Strategy
- Database backups (Supabase handles this)
- Code backups (GitHub)
- Configuration backups

## Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check Supabase URL and keys
# Verify RLS policies
# Check network connectivity
```

#### 2. Telebirr Integration
```bash
# Verify callback URLs
# Check webhook signatures
# Test with sandbox first
```

#### 3. Build Errors
```bash
# Clear node_modules and reinstall
# Check Node.js version compatibility
# Verify environment variables
```

### Performance Optimization

#### 1. Database Indexes
All necessary indexes are included in the schema.

#### 2. Image Optimization
- Use WebP format
- Implement lazy loading
- Compress images

#### 3. Code Splitting
Next.js automatically handles code splitting.

## Support

### Documentation
- API Documentation: `/api/docs`
- Component Documentation: `/docs/components`
- Database Schema: `supabase/schema.sql`

### Contact
- Technical Support: tech@dragonburger.et
- Payment Issues: payments@dragonburger.et
- General Support: support@dragonburger.et

## Security Considerations

1. **API Keys**: Never commit to version control
2. **Database**: Use RLS policies for data access
3. **Payments**: Validate all webhook signatures
4. **Authentication**: Enable 2FA for admin accounts
5. **HTTPS**: Always use HTTPS in production

## Scaling Considerations

1. **Database**: Monitor query performance
2. **CDN**: Use Vercel's built-in CDN
3. **Caching**: Implement Redis for frequent queries
4. **Load Balancing**: Vercel handles this automatically
5. **Monitoring**: Set up alerts for downtime

## Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **Code**: GitHub serves as code backup
3. **Assets**: Use CDN with proper caching
4. **Configuration**: Store securely in environment variables

---

**Congratulations!** Your DragonBurger restaurant management system is now deployed and ready for production use.
