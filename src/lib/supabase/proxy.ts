import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const path = request.nextUrl.pathname
  const publicPath =
    path === '/' ||
    path === '/login' ||
    path === '/signup' ||
    path === '/api/health' ||
    path === '/packages' || path.startsWith('/packages/') ||
    path === '/inquire' ||
    path.startsWith('/auth/') ||
    path.startsWith('/_next/') ||
    path === '/favicon.ico'

  // Health must remain reachable by external deployment monitors.
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user && !publicPath) {
    const next = request.nextUrl.clone()
    next.pathname = '/login'
    next.searchParams.set('next', path)
    return NextResponse.redirect(next)
  }

  if (user && path === '/login') {
    const next = request.nextUrl.clone()
    next.pathname = '/admin'
    next.search = ''
    return NextResponse.redirect(next)
  }

  // Never allow a shared CDN/proxy to cache authenticated responses that may
  // contain refreshed session cookies.
  if (user && !publicPath) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}
