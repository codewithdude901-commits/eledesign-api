'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

export const BusinessFooterLink: React.FC = () => {
  const params = useParams<{ locale?: 'de' | 'en' }>()
  const locale = params?.locale === 'en' ? 'en' : 'de'

  return (
    <div className="flex flex-col items-end gap-2 text-sm">
      <Link
        className="text-black underline-offset-4 hover:underline dark:text-white"
        href={`/${locale}/business/login`}
      >
        {locale === 'de' ? 'Geschäftskunden-Login' : 'Business login'}
      </Link>
      <Link
        className="underline-offset-4 hover:underline"
        href={`/${locale}/business/apply`}
      >
        {locale === 'de' ? 'Geschäftspartner werden' : 'Become a partner'}
      </Link>
    </div>
  )
}
