import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    const role = token.role as string
    // Managers can't access admin
    if (['MANAGER_COTTON', 'MANAGER_BEVERAGE'].includes(role) && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/reports', req.url))
    }
    // Clerks can only access station + tickets
    const clerkRoles = ['CLERK', 'GATE_CLERK', 'BRIDGE_CLERK']
    const clerkAllowed = ['/station', '/tickets', '/api']
    if (clerkRoles.includes(role) && !clerkAllowed.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/station', req.url))
    }
    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: ['/dashboard/:path*', '/gate/:path*', '/bridge/:path*', '/station/:path*', '/tickets/:path*', '/reports/:path*', '/admin/:path*'],
}
