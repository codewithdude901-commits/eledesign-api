'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/providers/Auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@/payload-types'

type Props = {
  locale: 'de' | 'en'
}

export const BusinessAccountForm: React.FC<Props> = ({ locale }) => {
  const { user } = useAuth()
  const businessUser = user as User | null

  const [name, setName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [invoiceEmail, setInvoiceEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [preferredLocale, setPreferredLocale] = useState<'de' | 'en'>('de')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!businessUser) return

    setName(businessUser.name || '')
    setContactPhone(businessUser.b2b?.contactPhone || '')
    setInvoiceEmail(businessUser.b2b?.invoiceEmail || businessUser.email || '')
    setWebsite(businessUser.b2b?.website || '')
    setPreferredLocale(businessUser.b2b?.preferredLocale === 'en' ? 'en' : 'de')
  }, [businessUser])

  if (!businessUser) {
    return <p className="text-sm text-primary/60">Loading...</p>
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${businessUser.id}`, {
        body: JSON.stringify({
          b2b: {
            ...(businessUser.b2b || {}),
            contactPhone,
            invoiceEmail,
            preferredLocale,
            website,
          },
          name,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })

      const data = (await response.json().catch(() => null)) as
        | { errors?: { message?: string }[]; message?: string }
        | null

      if (!response.ok) {
        toast.error(
          data?.errors?.[0]?.message ||
            (locale === 'de' ? 'Speichern fehlgeschlagen.' : 'Saving failed.'),
        )
        return
      }

      toast.success(locale === 'de' ? 'Konto aktualisiert.' : 'Account updated.')
      window.location.reload()
    } catch {
      toast.error(locale === 'de' ? 'Speichern fehlgeschlagen.' : 'Saving failed.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form className="grid gap-5 rounded-none border bg-white p-6" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold">{locale === 'de' ? 'Kontaktdaten' : 'Contact details'}</h2>

        <div className="grid gap-2">
          <Label htmlFor="account-name">{locale === 'de' ? 'Name' : 'Name'}</Label>
          <Input
            id="account-name"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-phone">{locale === 'de' ? 'Telefon' : 'Phone'}</Label>
          <Input
            id="account-phone"
            onChange={(event) => setContactPhone(event.target.value)}
            value={contactPhone}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-invoice-email">
            {locale === 'de' ? 'Rechnungs-E-Mail' : 'Invoice email'}
          </Label>
          <Input
            id="account-invoice-email"
            onChange={(event) => setInvoiceEmail(event.target.value)}
            type="email"
            value={invoiceEmail}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-website">{locale === 'de' ? 'Website' : 'Website'}</Label>
          <Input
            id="account-website"
            onChange={(event) => setWebsite(event.target.value)}
            value={website}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account-locale">{locale === 'de' ? 'Sprache' : 'Language'}</Label>
          <select
            className="h-9 rounded-none border bg-white px-3 text-sm"
            id="account-locale"
            onChange={(event) => setPreferredLocale(event.target.value === 'en' ? 'en' : 'de')}
            value={preferredLocale}
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>

        <Button disabled={isSaving} type="submit">
          {isSaving
            ? locale === 'de'
              ? 'Wird gespeichert...'
              : 'Saving...'
            : locale === 'de'
              ? 'Speichern'
              : 'Save'}
        </Button>

        <Link
          className="text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
          href={`/${locale}/business/forgot-password`}
        >
          {locale === 'de' ? 'Passwort ändern' : 'Change password'}
        </Link>
      </form>

      <aside className="h-fit rounded-none border bg-white p-6 text-sm">
        <h2 className="text-lg font-semibold">{locale === 'de' ? 'Firmendaten' : 'Company details'}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-primary/50">{locale === 'de' ? 'Firma' : 'Company'}</dt>
            <dd className="font-medium">{businessUser.b2b?.companyName || '-'}</dd>
          </div>
          <div>
            <dt className="text-primary/50">{locale === 'de' ? 'USt-IdNr.' : 'VAT ID'}</dt>
            <dd className="font-medium">{businessUser.b2b?.vatId || '-'}</dd>
          </div>
          <div>
            <dt className="text-primary/50">{locale === 'de' ? 'Status' : 'Status'}</dt>
            <dd className="font-medium">{businessUser.b2b?.status || '-'}</dd>
          </div>
          <div>
            <dt className="text-primary/50">{locale === 'de' ? 'Partnernachlass' : 'Partner discount'}</dt>
            <dd className="font-medium">{businessUser.b2b?.discountPercent || 0}%</dd>
          </div>
          <div>
            <dt className="text-primary/50">{locale === 'de' ? 'Anmelde-E-Mail' : 'Login email'}</dt>
            <dd className="font-medium">{businessUser.email}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-primary/50">
          {locale === 'de'
            ? 'Firmenname, USt-IdNr. und Nachlass werden von uns verwaltet. Kontaktieren Sie uns bei Änderungen.'
            : 'Company name, VAT ID and discount are managed by us. Contact us for changes.'}
        </p>
      </aside>
    </div>
  )
}
