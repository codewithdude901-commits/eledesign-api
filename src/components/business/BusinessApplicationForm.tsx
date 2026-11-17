'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  locale: 'de' | 'en'
}

type FormState = {
  address: {
    city: string
    country: string
    postalCode: string
    street: string
  }
  companyName: string
  contactName: string
  email: string
  message: string
  phone: string
  vatId: string
  website: string
}

const initialState: FormState = {
  address: {
    city: '',
    country: 'Deutschland',
    postalCode: '',
    street: '',
  },
  companyName: '',
  contactName: '',
  email: '',
  message: '',
  phone: '',
  vatId: '',
  website: '',
}

export const BusinessApplicationForm: React.FC<Props> = ({ locale }) => {
  const [form, setForm] = useState<FormState>(initialState)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateAddress = (key: keyof FormState['address'], value: string) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [key]: value,
      },
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/business-applications', {
        body: JSON.stringify({
          ...form,
          termsAccepted,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = (await response.json().catch(() => null)) as
        | { errors?: { message?: string }[]; message?: string }
        | null

      if (!response.ok) {
        setError(
          data?.errors?.[0]?.message ||
            data?.message ||
            (locale === 'de'
              ? 'Die Bewerbung konnte nicht gesendet werden.'
              : 'The application could not be submitted.'),
        )
        return
      }

      setSubmitted(true)
    } catch {
      setError(
        locale === 'de'
          ? 'Die Bewerbung konnte nicht gesendet werden.'
          : 'The application could not be submitted.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-none border border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-semibold text-emerald-900">
          {locale === 'de' ? 'Bewerbung eingegangen' : 'Application received'}
        </h2>
        <p className="mt-2 text-sm text-emerald-900">
          {locale === 'de'
            ? 'Wir prüfen Ihre Angaben und melden uns mit Ihren Zugangsdaten.'
            : 'We will review your details and send your login information.'}
        </p>
        <Link
          className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          href={`/${locale}/business/login`}
        >
          {locale === 'de' ? 'Zur Anmeldung' : 'Go to sign in'}
        </Link>
      </div>
    )
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="companyName">{locale === 'de' ? 'Firmenname' : 'Company name'}</Label>
        <Input
          id="companyName"
          onChange={(event) => update('companyName', event.target.value)}
          required
          value={form.companyName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contactName">{locale === 'de' ? 'Ansprechpartner' : 'Contact name'}</Label>
          <Input
            id="contactName"
            onChange={(event) => update('contactName', event.target.value)}
            required
            value={form.contactName}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="applicationEmail">{locale === 'de' ? 'E-Mail' : 'Email'}</Label>
          <Input
            id="applicationEmail"
            onChange={(event) => update('email', event.target.value)}
            required
            type="email"
            value={form.email}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">{locale === 'de' ? 'Telefon' : 'Phone'}</Label>
          <Input
            id="phone"
            onChange={(event) => update('phone', event.target.value)}
            value={form.phone}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="vatId">{locale === 'de' ? 'USt-IdNr.' : 'VAT ID'}</Label>
          <Input
            id="vatId"
            onChange={(event) => update('vatId', event.target.value)}
            value={form.vatId}
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="website">{locale === 'de' ? 'Website' : 'Website'}</Label>
          <Input
            id="website"
            onChange={(event) => update('website', event.target.value)}
            value={form.website}
          />
        </div>
      </div>

      <fieldset className="grid gap-4 rounded-none border p-4">
        <legend className="px-2 text-sm font-medium">
          {locale === 'de' ? 'Rechnungsadresse' : 'Billing address'}
        </legend>

        <div className="grid gap-2">
          <Label htmlFor="street">{locale === 'de' ? 'Straße und Hausnummer' : 'Street'}</Label>
          <Input
            id="street"
            onChange={(event) => updateAddress('street', event.target.value)}
            value={form.address.street}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="postalCode">{locale === 'de' ? 'PLZ' : 'Postal code'}</Label>
            <Input
              id="postalCode"
              onChange={(event) => updateAddress('postalCode', event.target.value)}
              value={form.address.postalCode}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">{locale === 'de' ? 'Ort' : 'City'}</Label>
            <Input
              id="city"
              onChange={(event) => updateAddress('city', event.target.value)}
              value={form.address.city}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">{locale === 'de' ? 'Land' : 'Country'}</Label>
            <Input
              id="country"
              onChange={(event) => updateAddress('country', event.target.value)}
              value={form.address.country}
            />
          </div>
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="message">
          {locale === 'de' ? 'Nachricht / Sortiment' : 'Message / product interests'}
        </Label>
        <Textarea
          id="message"
          onChange={(event) => update('message', event.target.value)}
          rows={5}
          value={form.message}
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          checked={termsAccepted}
          className="mt-1"
          onChange={(event) => setTermsAccepted(event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          {locale === 'de'
            ? 'Ich akzeptiere die Geschäftspartner-Bedingungen und bestätige die Richtigkeit meiner Angaben.'
            : 'I accept the business partner terms and confirm that my details are correct.'}
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting
          ? locale === 'de'
            ? 'Wird gesendet...'
            : 'Submitting...'
          : locale === 'de'
            ? 'Bewerbung senden'
            : 'Submit application'}
      </Button>
    </form>
  )
}
