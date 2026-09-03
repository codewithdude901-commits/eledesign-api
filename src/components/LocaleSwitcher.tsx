'use client'

import { Languages } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const locales = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
]

export function LocaleSwitcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const segments = pathname.split('/').filter(Boolean)

  const currentLocale = segments[0] === 'en' || segments[0] === 'de' ? segments[0] : 'de'

  const pathWithoutLocale =
    segments[0] === 'en' || segments[0] === 'de' ? `/${segments.slice(1).join('/')}` : pathname

  const queryString = searchParams.toString()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getHref = (locale: string) => {
    const href =
      locale === 'de'
        ? pathWithoutLocale || '/'
        : `/en${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`

    return queryString ? `${href}?${queryString}` : href
  }

  const currentLabel = locales.find((locale) => locale.code === currentLocale)?.label ?? 'Deutsch'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-brand-charcoal/70 transition-colors hover:text-brand-charcoal"
      >
        <Languages className="h-5 w-5" />

        {/* <span className="text-sm font-medium">
          {currentLocale.toUpperCase()}
        </span> */}

        {/* <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} /> */}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[130px] overflow-hidden border border-brand-charcoal/10 bg-white p-1 shadow-lg"
        >
          {locales.map((locale) => (
            <Link
              key={locale.code}
              href={getHref(locale.code)}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 text-sm transition-colors ${
                locale.code === currentLocale
                  ? 'bg-brand-charcoal/5 font-semibold text-brand-charcoal'
                  : 'text-brand-charcoal/70 hover:bg-brand-charcoal/5 hover:text-brand-charcoal'
              }`}
            >
              {locale.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
