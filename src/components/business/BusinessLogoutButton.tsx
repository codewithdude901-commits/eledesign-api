'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  locale: 'de' | 'en'
}

export const BusinessLogoutButton: React.FC<Props> = ({ locale }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await fetch('/api/users/logout', {
        credentials: 'include',
        method: 'POST',
      })
    } catch {
      // Ignore network errors; still clear local state and navigate.
    }

    try {
      window.localStorage.removeItem('cart')
      window.localStorage.removeItem('cart_secret')
    } catch {
      // Ignore localStorage restrictions.
    }

    window.location.href = `/${locale}/business/login`
  }

  return (
    <Button disabled={isLoading} onClick={handleLogout} type="button">
      {isLoading
        ? locale === 'de'
          ? 'Abmeldung...'
          : 'Signing out...'
        : locale === 'de'
          ? 'Abmelden'
          : 'Sign out'}
    </Button>
  )
}
