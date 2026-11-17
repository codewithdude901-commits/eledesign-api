'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  locale: 'de' | 'en'
}

export const BusinessForgotPasswordForm: React.FC<Props> = ({ locale }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/business/forgot-password', {
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setError(
          locale === 'de'
            ? 'Die Anfrage konnte nicht gesendet werden.'
            : 'The request could not be sent.',
        )
        return
      }

      setSubmitted(true)
    } catch {
      setError(
        locale === 'de'
          ? 'Die Anfrage konnte nicht gesendet werden.'
          : 'The request could not be sent.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-none border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-900">
        {locale === 'de'
          ? 'Wenn ein freigegebenes Geschäftskonto existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.'
          : 'If an approved business account exists, a password reset link has been sent.'}
      </div>
    )
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="forgot-email">{locale === 'de' ? 'E-Mail' : 'Email'}</Label>
        <Input
          id="forgot-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? locale === 'de'
            ? 'Wird gesendet...'
            : 'Sending...'
          : locale === 'de'
            ? 'Link anfordern'
            : 'Request link'}
      </Button>

      <Link
        className="text-sm text-primary/70 underline-offset-4 hover:text-primary hover:underline"
        href={`/${locale}/business/login`}
      >
        {locale === 'de' ? 'Zurück zur Anmeldung' : 'Back to sign in'}
      </Link>
    </form>
  )
}
