'use client'
import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  locale: 'de' | 'en'
  token: string
}

export const ResetPasswordForm: React.FC<Props> = ({ locale, token }) => {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError(
        locale === 'de' ? 'Die Passwörter stimmen nicht überein.' : 'Passwords do not match.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users/reset-password', {
        body: JSON.stringify({
          password,
          passwordConfirm,
          token,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = (await response.json().catch(() => null)) as {
        errors?: { message?: string }[]
        message?: string
      } | null

      if (!response.ok) {
        setError(
          data?.errors?.[0]?.message ||
            data?.message ||
            (locale === 'de'
              ? 'Das Passwort konnte nicht gesetzt werden.'
              : 'The password could not be set.'),
        )
        return
      }

      window.location.href = `/${locale}`
    } catch {
      setError(
        locale === 'de'
          ? 'Das Passwort konnte nicht gesetzt werden.'
          : 'The password could not be set.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="reset-password">
          {locale === 'de' ? 'Neues Passwort' : 'New password'}
        </Label>
        <Input
          autoComplete="new-password"
          id="reset-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reset-password-confirm">
          {locale === 'de' ? 'Passwort bestätigen' : 'Confirm password'}
        </Label>
        <Input
          autoComplete="new-password"
          id="reset-password-confirm"
          minLength={8}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
          type="password"
          value={passwordConfirm}
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? locale === 'de'
            ? 'Wird gespeichert...'
            : 'Saving...'
          : locale === 'de'
            ? 'Passwort speichern'
            : 'Save password'}
      </Button>

      <Link
        className="text-sm text-primary/70 underline-offset-4 hover:text-primary hover:underline"
        href={`/${locale}/login`}
      >
        {locale === 'de' ? 'Zur Anmeldung' : 'Go to sign in'}
      </Link>
    </form>
  )
}
