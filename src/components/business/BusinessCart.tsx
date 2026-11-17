'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

import { Button } from '@/components/ui/button'
import { useRepriceB2BCart } from '@/b2b/hooks/useRepriceB2BCart'
import { formatEuro } from '@/b2b/utilities/pricing'

type CartItem = {
  b2bIssue?: null | string
  id: string
  lineTotal?: null | number
  product?:
    | { common_name?: null | string; title?: null | string }
    | string
    | null
  quantity: number
  unitPrice?: null | number
  variant?: { title?: null | string } | string | null
}

type CartShape = {
  id: string
  items?: CartItem[] | null
  subtotal?: null | number
}

type Props = {
  locale: 'de' | 'en'
  vatRatePercent: number
}

export const BusinessCart: React.FC<Props> = ({ locale, vatRatePercent }) => {
  const { cart: rawCart, isLoading, refreshCart } = useCart()
  const cart = rawCart as unknown as CartShape
  const [isMutating, setIsMutating] = useState(false)

  useRepriceB2BCart({ cart, refreshCart })

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      void refreshCart().catch(() => {})
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [refreshCart])

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

  const mutate = async (itemID: string, action: 'remove' | 'set', quantity?: number) => {
    if (!cart?.id || isMutating) return

    setIsMutating(true)

    try {
      const path =
        action === 'remove'
          ? `/api/carts/${cart.id}/remove-item`
          : `/api/carts/${cart.id}/update-item`
      const body = action === 'remove' ? { itemID } : { itemID, quantity }

      const response = await fetch(path, {
        body: JSON.stringify(body),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Cart update failed')
      }

      await refreshCart()
    } catch {
      toast.error(
        locale === 'de'
          ? 'Der Warenkorb konnte nicht aktualisiert werden.'
          : 'The cart could not be updated.',
      )
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading && !cart) {
    return <p className="text-sm text-primary/60">Loading...</p>
  }

  if (!cart || items.length === 0) {
    return (
      <div className="rounded-none border bg-white p-8">
        <h1 className="text-2xl font-semibold">
          {locale === 'de' ? 'Ihr B2B-Warenkorb ist leer' : 'Your B2B cart is empty'}
        </h1>
        <p className="mt-2 text-sm text-primary/60">
          {locale === 'de'
            ? 'Fügen Sie Produkte aus dem B2B-Katalog hinzu.'
            : 'Add products from the B2B catalog.'}
        </p>
        <Link
          className="mt-5 inline-block rounded-none bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          href={`/${locale}/business/catalog`}
        >
          {locale === 'de' ? 'Zum Katalog' : 'Go to catalog'}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-none border bg-white">
        <div className="border-b px-5 py-4">
          <h1 className="text-2xl font-semibold">{locale === 'de' ? 'Warenkorb' : 'Cart'}</h1>
        </div>

        <ul>
          {items.map((item) => {
            const productName =
              item.product && typeof item.product === 'object'
                ? locale === 'de'
                  ? item.product.common_name || item.product.title
                  : item.product.title
                : locale === 'de'
                  ? 'Produkt'
                  : 'Product'
            const variantName =
              item.variant && typeof item.variant === 'object' ? item.variant.title : null

            return (
              <li className="border-b px-5 py-5 last:border-none" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{productName}</p>
                    {variantName && <p className="text-sm text-primary/50">{variantName}</p>}
                    {item.b2bIssue && (
                      <p className="mt-2 rounded-none bg-amber-50 px-2 py-1 text-xs text-amber-900">
                        {item.b2bIssue}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      disabled={isMutating || item.quantity <= 1}
                      onClick={() => mutate(item.id, 'set', item.quantity - 1)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      -
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      disabled={isMutating}
                      onClick={() => mutate(item.id, 'set', item.quantity + 1)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{formatEuro(item.lineTotal || 0)}</p>
                    <p className="text-xs text-primary/50">
                      {formatEuro(item.unitPrice || 0)} / {locale === 'de' ? 'Stk.' : 'unit'} net
                    </p>
                    <button
                      className="mt-2 text-xs text-red-700 underline underline-offset-4"
                      disabled={isMutating}
                      onClick={() => mutate(item.id, 'remove')}
                      type="button"
                    >
                      {locale === 'de' ? 'Entfernen' : 'Remove'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-none border bg-white p-5">
        <h2 className="text-lg font-semibold">{locale === 'de' ? 'Zusammenfassung' : 'Summary'}</h2>

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

        {hasIssues && (
          <p className="mt-4 rounded-none bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {locale === 'de'
              ? 'Bitte korrigieren Sie die markierten Positionen, bevor Sie zur Kasse gehen.'
              : 'Please fix the marked lines before checking out.'}
          </p>
        )}

        <Link
          aria-disabled={hasIssues}
          className={
            hasIssues
              ? 'pointer-events-none mt-5 block rounded-none bg-stone-300 px-4 py-2 text-center text-sm font-medium text-white'
              : 'mt-5 block rounded-none bg-stone-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-stone-800'
          }
          href={`/${locale}/business/checkout`}
        >
          {locale === 'de' ? 'Zur Kasse' : 'Checkout'}
        </Link>

        <Link
          className="mt-3 block text-center text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
          href={`/${locale}/business/catalog`}
        >
          {locale === 'de' ? 'Weiter einkaufen' : 'Continue shopping'}
        </Link>
      </aside>
    </div>
  )
}
