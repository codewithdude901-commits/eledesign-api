'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Address } from '@/payload-types'
import { useRepriceB2BCart } from '@/b2b/hooks/useRepriceB2BCart'
import { formatEuro } from '@/b2b/utilities/pricing'

type CartItem = {
  b2bIssue?: null | string
  id: string
  lineTotal?: null | number
  quantity: number
}

type CartShape = {
  id: string
  items?: CartItem[] | null
  subtotal?: null | number
}

type Props = {
  locale: 'de' | 'en'
  termsUrl?: null | string
  vatRatePercent: number
}

export const BusinessCheckout: React.FC<Props> = ({ locale, termsUrl, vatRatePercent }) => {
  const { cart: rawCart, isLoading: isCartLoading, refreshCart } = useCart()
  const cart = rawCart as unknown as CartShape
  const [billingAddress, setBillingAddress] = useState<Partial<Address> | undefined>()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address> | undefined>()
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const items = cart?.items || []
  const hasIssues = items.some((item) => Boolean(item.b2bIssue))
  const netSubtotal = useMemo(
    () =>
      typeof cart?.subtotal === 'number'
        ? cart.subtotal
        : items.reduce((sum, item) => sum + (item.lineTotal || 0), 0),
    [cart?.subtotal, items],
  )
  const vatAmount = Math.round((netSubtotal * vatRatePercent) / 100)
  const grossAmount = netSubtotal + vatAmount

  useRepriceB2BCart({ cart, refreshCart })

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      void refreshCart().catch(() => {})
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [refreshCart])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitLock.current) return

    setError(null)

    if (!billingAddress) {
      setError(
        locale === 'de'
          ? 'Bitte wählen Sie eine Rechnungsadresse.'
          : 'Please select a billing address.',
      )
      return
    }

    if (!cart?.id || items.length === 0) {
      setError(locale === 'de' ? 'Ihr Warenkorb ist leer.' : 'Your cart is empty.')
      return
    }

    if (hasIssues) {
      setError(
        locale === 'de'
          ? 'Bitte korrigieren Sie zuerst die markierten Warenkorbpositionen.'
          : 'Please fix the marked cart lines first.',
      )
      return
    }

    submitLock.current = true
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/b2b/checkout', {
        body: JSON.stringify({
          billingAddress,
          cartID: cart.id,
          customerNotes,
          locale,
          purchaseOrderNumber,
          shippingAddress: shippingAddress || billingAddress,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const result = (await response.json().catch(() => null)) as
        | { error?: string; orderID?: string }
        | null

      if (!response.ok || !result?.orderID) {
        submitLock.current = false
        setIsSubmitting(false)
        setError(
          result?.error ||
            (locale === 'de'
              ? 'Die Bestellung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.'
              : 'The order could not be completed. Please try again.'),
        )
        return
      }

      // Replace the checkout entry so Back cannot reopen a stale checkout.
      // Do not refresh the cart here: that would swap the page to the
      // empty-cart view for a moment before navigation completes.
      window.location.replace(`/${locale}/business/orders/${result.orderID}`)
    } catch (submitError) {
      submitLock.current = false
      setIsSubmitting(false)
      setError(
        submitError instanceof Error && submitError.message
          ? submitError.message
          : locale === 'de'
            ? 'Die Bestellung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.'
            : 'The order could not be completed. Please try again.',
      )
    }
  }

  if (isCartLoading && !cart) {
    return <p className="text-sm text-primary/60">Loading...</p>
  }

  if (!isSubmitting && (!cart || items.length === 0)) {
    return (
      <div className="rounded-none border bg-white p-8">
        <h1 className="text-2xl font-semibold">
          {locale === 'de' ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
        </h1>
        <Link
          className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          href={`/${locale}/business/catalog`}
        >
          {locale === 'de' ? 'Zum Katalog' : 'Go to catalog'}
        </Link>
      </div>
    )
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold">{locale === 'de' ? 'B2B-Kasse' : 'B2B checkout'}</h1>
          <p className="mt-1 text-sm text-primary/60">
            {locale === 'de'
              ? 'Bestellung auf Rechnung. Die Zahlung erfolgt per Überweisung an uns.'
              : 'Order by invoice. Payment is made by bank transfer directly to us.'}
          </p>
        </div>

        <section className="rounded-none border bg-white p-5">
          {billingAddress ? (
            <AddressItem
              address={billingAddress as Address}
              beforeActions={
                <Button
                  onClick={() => setBillingAddress(undefined)}
                  type="button"
                  variant="outline"
                >
                  {locale === 'de' ? 'Ändern' : 'Change'}
                </Button>
              }
              hideDefaultActions
              locale={locale}
            />
          ) : (
            <CheckoutAddresses
              addressType="billing"
              heading={locale === 'de' ? 'Rechnungsadresse' : 'Billing address'}
              locale={locale}
              selectedAddress={billingAddress as Address | undefined}
              setAddress={setBillingAddress}
            />
          )}
        </section>

        <section className="rounded-none border bg-white p-5">
          {shippingAddress ? (
            <AddressItem
              address={shippingAddress as Address}
              beforeActions={
                <Button
                  onClick={() => setShippingAddress(undefined)}
                  type="button"
                  variant="outline"
                >
                  {locale === 'de' ? 'Ändern' : 'Change'}
                </Button>
              }
              hideDefaultActions
              locale={locale}
            />
          ) : (
            <CheckoutAddresses
              addressType="shipping"
              heading={locale === 'de' ? 'Lieferadresse' : 'Shipping address'}
              locale={locale}
              selectedAddress={shippingAddress as Address | undefined}
              setAddress={setShippingAddress}
            />
          )}
          <p className="mt-3 text-xs text-primary/50">
            {locale === 'de'
              ? 'Wenn keine Lieferadresse gewählt wird, verwenden wir die Rechnungsadresse.'
              : 'If no shipping address is selected, the billing address is used.'}
          </p>
        </section>

        <section className="grid gap-4 rounded-none border bg-white p-5">
          <div className="grid gap-2">
            <Label htmlFor="po-number">
              {locale === 'de' ? 'Bestellnummer / PO (optional)' : 'Purchase order number (optional)'}
            </Label>
            <Input
              id="po-number"
              onChange={(event) => setPurchaseOrderNumber(event.target.value)}
              value={purchaseOrderNumber}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customer-notes">
              {locale === 'de' ? 'Anmerkungen (optional)' : 'Notes (optional)'}
            </Label>
            <Textarea
              id="customer-notes"
              onChange={(event) => setCustomerNotes(event.target.value)}
              rows={3}
              value={customerNotes}
            />
          </div>
        </section>

        <section className="rounded-none border bg-white p-5">
          <h2 className="text-lg font-semibold">{locale === 'de' ? 'Zahlung' : 'Payment'}</h2>
          <div className="mt-3 rounded-none border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">
              {locale === 'de' ? 'Rechnung / Banküberweisung' : 'Invoice / Bank transfer'}
            </p>
            <p className="mt-1">
              {locale === 'de'
                ? 'Nach dem Absenden erhalten Sie eine Rechnung mit unseren Bankdaten und Zahlungsziel.'
                : 'After submitting, you will receive an invoice with our bank details and due date.'}
            </p>
            {termsUrl && (
              <a
                className="mt-2 inline-block underline underline-offset-4"
                href={termsUrl}
                rel="noreferrer"
                target="_blank"
              >
                {locale === 'de' ? 'Geschäftsbedingungen' : 'Business terms'}
              </a>
            )}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-none border bg-white p-5">
        <h2 className="text-lg font-semibold">{locale === 'de' ? 'Bestellübersicht' : 'Order summary'}</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>{locale === 'de' ? 'Netto' : 'Net'}</dt>
            <dd>{formatEuro(netSubtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{locale === 'de' ? `MwSt. (${vatRatePercent}%)` : `VAT (${vatRatePercent}%)`}</dt>
            <dd>{formatEuro(vatAmount)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>{locale === 'de' ? 'Gesamt' : 'Total'}</dt>
            <dd>{formatEuro(grossAmount)}</dd>
          </div>
        </dl>

        {error && <p className="mt-4 rounded-none bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <Button className="mt-5 w-full" disabled={isSubmitting || hasIssues} type="submit">
          {isSubmitting
            ? locale === 'de'
              ? 'Bestellung wird gesendet...'
              : 'Placing order...'
            : locale === 'de'
              ? 'Bestellung aufgeben'
              : 'Place order'}
        </Button>

        <Link
          className="mt-3 block text-center text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
          href={`/${locale}/business/cart`}
        >
          {locale === 'de' ? 'Zurück zum Warenkorb' : 'Back to cart'}
        </Link>
      </aside>
    </form>
  )
}
