'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  locale: 'de' | 'en'
  warning?: string
}

export const BusinessLoginForm: React.FC<Props> = ({ locale, warning }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/login', {
        body: JSON.stringify({
          email,
          password,
          portal: 'business',
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-b2b-portal': 'true',
        },
        method: 'POST',
      })

      const data = (await response.json().catch(() => null)) as
        | { errors?: { message?: string }[]; message?: string }
        | null

      if (!response.ok || data?.errors?.length) {
        setError(
          data?.errors?.[0]?.message ||
            data?.message ||
            (locale === 'de'
              ? 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.'
              : 'Login failed. Please check your credentials.'),
        )
        return
      }

      try {
        window.localStorage.removeItem('cart')
        window.localStorage.removeItem('cart_secret')
      } catch {
        // localStorage may be unavailable in strict privacy modes.
      }

      window.location.href = `/${locale}/business/dashboard`
    } catch {
      setError(
        locale === 'de'
          ? 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'
          : 'Login failed. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {warning && (
        <p className="rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warning}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="business-email">{locale === 'de' ? 'E-Mail' : 'Email'}</Label>
        <Input
          autoComplete="email"
          id="business-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="business-password">{locale === 'de' ? 'Passwort' : 'Password'}</Label>
        <Input
          autoComplete="current-password"
          id="business-password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <Button disabled={isLoading} type="submit">
        {isLoading
          ? locale === 'de'
            ? 'Anmeldung...'
            : 'Signing in...'
          : locale === 'de'
            ? 'Anmelden'
            : 'Sign in'}
      </Button>

      <div className="flex flex-wrap justify-between gap-3 text-sm">
        <Link
          className="text-primary/70 underline-offset-4 hover:text-primary hover:underline"
          href={`/${locale}/business/forgot-password`}
        >
          {locale === 'de' ? 'Passwort vergessen?' : 'Forgot password?'}
        </Link>
        <Link
          className="text-primary/70 underline-offset-4 hover:text-primary hover:underline"
          href={`/${locale}/business/apply`}
        >
          {locale === 'de' ? 'Geschäftspartner werden' : 'Become a business partner'}
        </Link>
      </div>
    </form>
  )
}
