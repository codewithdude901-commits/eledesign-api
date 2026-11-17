'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { Footer } from '@/components/Footer'

export const ConditionalFooter: React.FC = () => {
  const pathname = usePathname()

  if (pathname.includes('/business')) {
    return null
  }

  return <Footer />
}
