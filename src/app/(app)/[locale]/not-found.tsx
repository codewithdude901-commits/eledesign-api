'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  const pathname = usePathname()

  const isEnglish = pathname === '/en' || pathname.startsWith('/en/')
  const locale = isEnglish ? 'en' : 'de'

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>

        <p className="mb-4">
          {locale === 'de'
            ? 'Diese Seite konnte nicht gefunden werden.'
            : 'This page could not be found.'}
        </p>
      </div>

      <Button asChild variant="default" className='rounded-none'>
        <Link href={locale === 'de' ? '/' : '/en'}>
          {locale === 'de' ? 'Zur Startseite' : 'Go home'}
        </Link>
      </Button>
    </div>
  )
}