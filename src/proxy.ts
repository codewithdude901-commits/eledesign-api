import { NextRequest, NextResponse } from 'next/server'

const defaultLocale = 'de'
const locales = ['de', 'en']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore Next.js internals, API routes and files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --------------------------------  ------------------
  // 1. Remove /de from public URLs
  // --------------------------------------------------

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone()

    url.pathname = pathname === `/${defaultLocale}` ? '/' : pathname.slice(defaultLocale.length + 1)

    return NextResponse.redirect(url)
  }

  // --------------------------------------------------
  // 2. English URLs stay as they are
  // --------------------------------------------------

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next()
  }

  // --------------------------------------------------
  // 3. Everything else is German
  //
  // /       -> internally /de
  // /about  -> internally /de/about
  // --------------------------------------------------

  const url = request.nextUrl.clone()

  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
