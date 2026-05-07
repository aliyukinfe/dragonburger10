# dragon burger -restaurant

Next.js + Supabase restaurant management system with:
- Orders and real-time sync
- Menu management
- Udhaar tracking
- Reports
- Account activation/shutdown checks

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill:
   - `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
3. Run SQL from `supabase/schema.sql` in Supabase SQL editor
4. Create one user in Supabase Auth
5. Enable realtime replication for `orders`
6. Run app:

```bash
npm install
npm run dev
```

## Deployment

- Push to GitHub
- Import repo in Vercel
- Add environment variables
- Deploy

## Account Deactivation

Supabase table `account_status` controls access:
- Set `is_active = false` to lock account
- Set `expires_at` for scheduled shutdown
- Set `is_active = true` and clear/update `expires_at` to reactivate
