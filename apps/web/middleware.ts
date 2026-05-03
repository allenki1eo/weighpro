import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const role = token.role as string

    // Gate clerks can only access gate + common pages
    const gateOnly = ['/bridge']
    const bridgeOnly = ['/gate']

    if (role === 'GATE_CLERK' && gateOnly.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/gate', req.url))
    }
    if (role === 'BRIDGE_CLERK' && bridgeOnly.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/bridge', req.url))
    }

    // Managers can't access admin
    if (['MANAGER_COTTON', 'MANAGER_BEVERAGE'].includes(role) && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/reports', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/gate/:path*',
    '/bridge/:path*',
    '/tickets/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/master/:path*',
    '/audit/:path*',
  ],
}
