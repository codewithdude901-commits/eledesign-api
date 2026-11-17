'use client'

import { ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import React, { Suspense } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Cart } from './Cart'
import { OpenCartButton } from './Cart/OpenCart'
import { MobileMenu } from './MobileMenu'

import { LocaleSwitcher } from '@/components/LocaleSwitcher'

export const Navbar: React.FC = () => {
  const pathname = usePathname()
  const { cart } = useCart()

  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale
  const isBusiness = pathname.includes('/business')
  const businessCartCount = (cart as unknown as { items?: unknown[] } | null)?.items?.length || 0

  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // const [isProfileOpen, setIsProfileOpen] = useState(false)

  // const profileRef = useRef<HTMLDivElement>(null)

  const navLinksDe = [
    { name: 'Gartenpakete', href: '/gardens' },
    { name: 'AI-Konzept-Builder', href: '/your-garden' },
    { name: 'Pflanzanleitung', href: '/plant-guide' },
    { name: 'Kontakt', href: '/contact' },
  ]

  const navLinksEn = [
    { name: 'Gardens', href: '/en/gardens' },
    { name: 'AI Studio', href: '/en/your-garden' },
    { name: 'Planting Guide', href: '/en/plant-guide' },
    { name: 'Contact', href: '/en/contact' },
  ]

  const navLinks = locale === 'de' ? navLinksDe : navLinksEn

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[8vh] flex items-center justify-between">
          {/* Left: Logo */}
          {!isBusiness && (
            <div className="block flex-none md:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={navLinks} locale={locale} />
              </Suspense>
            </div>
          )}
          <div className="flex items-center overflow-hidden h-full">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 group focus:outline-none w-48 justify-center h-full "
            >
              <img src={'/logo.jpeg'} className="w-full max-w-40 md:max-w-60 h-auto  md:-ml-4 " />
            </Link>
          </div>

          {/* Center: Links (Desktop) */}
          <nav className={isBusiness ? 'hidden' : 'hidden md:flex items-center space-x-6'}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-sm font-medium transition-all duration-200  focus:outline-none ${
                    isActive ? 'font-semibold' : 'text-black/80 '
                  }`}
                >
                  {link.name}

                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-700 scale-x-0 origin-left transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 ">
            <Suspense fallback={null}>
              <LocaleSwitcher />
            </Suspense>
            <Link
              href={isBusiness ? `/${locale}/business/dashboard` : `/${locale}/account`}
              className="p-2.5 rounded-none text-black  hover:bg-black/5 transition-all duration-200 focus:outline-none  items-center justify-center hidden md:flex"
            >
              <User className="w-5.5 h-5.5" />
            </Link>

            {/* Shopping Cart Button */}
            {isBusiness ? (
              <Link
                className="relative flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium hover:bg-black/5"
                href={`/${locale}/business/cart`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">B2B</span>
                {businessCartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-none bg-emerald-700 px-1 text-[10px] font-semibold text-white">
                    {businessCartCount}
                  </span>
                )}
              </Link>
            ) : (
              <Suspense fallback={<OpenCartButton />}>
                <Cart locale={locale} />
              </Suspense>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
