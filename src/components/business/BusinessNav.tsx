'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utilities/cn'

type Props = {
  companyName?: null | string
  locale: 'de' | 'en'
  vatId?: null | string
}

export const BusinessNav: React.FC<Props> = ({ companyName, locale, vatId }) => {
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/business/dashboard`, label: locale === 'de' ? 'Übersicht' : 'Dashboard' },
    { href: `/${locale}/business/catalog`, label: locale === 'de' ? 'Katalog' : 'Catalog' },
    { href: `/${locale}/business/orders`, label: locale === 'de' ? 'Bestellungen' : 'Orders' },
    { href: `/${locale}/business/cart`, label: locale === 'de' ? 'Warenkorb' : 'Cart' },
    { href: `/${locale}/business/account`, label: locale === 'de' ? 'Konto' : 'Account' },
    { href: `/${locale}/business/addresses`, label: locale === 'de' ? 'Adressen' : 'Addresses' },
  ]

  return (
    <div className="border border-brand-charcoal/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-charcoal/10 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="border border-emerald-700 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
            B2B
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/40">
              {locale === 'de' ? 'Geschäftskundenportal' : 'Business portal'}
            </p>
            <p className="text-sm font-semibold text-brand-charcoal">
              {companyName || (locale === 'de' ? 'Geschäftskonto' : 'Business account')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {vatId ? (
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 sm:inline">
              {locale === 'de' ? 'USt-IdNr.' : 'VAT'} {vatId}
            </span>
          ) : null}

          <Link
            className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/50 underline-offset-4 transition-colors hover:text-brand-charcoal hover:underline"
            href={`/${locale}/business/logout`}
          >
            {locale === 'de' ? 'Abmelden' : 'Sign out'}
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-1 px-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={cn(
                'border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors',
                active
                  ? 'border-emerald-700 text-brand-charcoal'
                  : 'border-transparent text-brand-charcoal/50 hover:text-brand-charcoal',
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
