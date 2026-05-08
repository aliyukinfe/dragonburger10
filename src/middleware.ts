import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Inject x-pathname so root layout can detect route without client-side check
  const res = NextResponse.next({
    request: { headers: new Headers({ ...Object.fromEntries(req.headers), 'x-pathname': path }) },
  })
  res.headers.set('x-pathname', path)

  // Skip auth checks for public ordering paths
  const publicPaths = ['/order/', '/order-success', '/waiter']
  if (publicPaths.some(p => path.startsWith(p))) return res

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  // Skip auth if Supabase isn't configured
  if (supabaseUrl === 'https://placeholder.supabase.co') return res

  const supabase = createClient(supabaseUrl, supabaseKey)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/admin', '/kitchen', '/driver', '/profile']
  const adminRoutes = ['/admin']
  const staffRoutes = ['/admin', '/kitchen']
  const driverRoutes = ['/driver']

  // Check if user is accessing a protected route
  if (protectedRoutes.some(route => path.startsWith(route))) {
    if (!session) {
      // Redirect to login if no session
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(loginUrl)
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      // If no profile found, redirect to login
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Check role-based access
    if (adminRoutes.some(route => path.startsWith(route)) && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (staffRoutes.some(route => path.startsWith(route)) && !['admin', 'staff'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (driverRoutes.some(route => path.startsWith(route)) && !['admin', 'staff', 'driver'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
