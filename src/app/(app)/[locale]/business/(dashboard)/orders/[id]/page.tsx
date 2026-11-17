import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { BusinessOrderStatus } from '@/components/business/BusinessOrderStatus'
import type { Address, Order, User } from '@/payload-types'
import { formatEuro } from '@/b2b/utilities/pricing'

type Props = {
  params: Promise<{
    id: string
    locale: 'de' | 'en'
  }>
}

const formatAddress = (address?: null | Partial<Address>) => {
  if (!address) return null

  const lines = [
    address.company,
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.addressLine1,
    address.addressLine2,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.country,
    address.phone,
  ].filter(Boolean)

  return lines.length ? lines : null
}

export default async function BusinessOrderDetailPage({ params }: Props) {
  const { id, locale } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User

  const order = (await payload.findByID({
    collection: 'orders',
    depth: 2,
    id,
    overrideAccess: false,
    user: businessUser,
  })) as Order | null

  if (!order || order.channel !== 'b2b') {
    notFound()
  }

  const billingLines = formatAddress(order.billingAddress as Partial<Address>)
  const shippingLines = formatAddress(order.shippingAddress as Partial<Address>)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
            href={`/${locale}/business/orders`}
          >
            {locale === 'de' ? 'Zurück zu den Bestellungen' : 'Back to orders'}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">
            {locale === 'de' ? 'Bestellung' : 'Order'}{' '}
            {order.invoice?.invoiceNumber || order.id}
          </h1>
          <p className="mt-1 text-sm text-primary/60">
            {new Date(order.createdAt).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BusinessOrderStatus locale={locale} status={order.b2bStatus} />
          <Link
            className="rounded-none border px-4 py-2 text-sm hover:bg-stone-100"
            href={`/${locale}/business/orders/${order.id}/invoice`}
            target="_blank"
          >
            {locale === 'de' ? 'Rechnung drucken' : 'Print invoice'}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-none border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{locale === 'de' ? 'Positionen' : 'Items'}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-stone-50 text-xs uppercase tracking-wide text-primary/50">
                  <tr>
                    <th className="px-5 py-3">{locale === 'de' ? 'Produkt' : 'Product'}</th>
                    <th className="px-5 py-3">{locale === 'de' ? 'Menge' : 'Qty'}</th>
                    <th className="px-5 py-3">{locale === 'de' ? 'Einzelpreis' : 'Unit price'}</th>
                    <th className="px-5 py-3">{locale === 'de' ? 'Summe' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, index) => (
                    <tr
                      className="border-b last:border-none"
                      key={item.id || item.product_name || index}
                    >
                      <td className="px-5 py-4">{item.product_name || '-'}</td>
                      <td className="px-5 py-4">{item.quantity}</td>
                      <td className="px-5 py-4">{formatEuro(item.unitPrice || 0)}</td>
                      <td className="px-5 py-4">{formatEuro(item.lineTotal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-none border bg-white p-5">
              <h2 className="font-semibold">{locale === 'de' ? 'Rechnungsadresse' : 'Billing address'}</h2>
              {billingLines ? (
                <address className="mt-2 text-sm not-italic text-primary/70">
                  {billingLines.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </address>
              ) : (
                <p className="mt-2 text-sm text-primary/50">-</p>
              )}
            </div>

            <div className="rounded-none border bg-white p-5">
              <h2 className="font-semibold">{locale === 'de' ? 'Lieferadresse' : 'Shipping address'}</h2>
              {shippingLines ? (
                <address className="mt-2 text-sm not-italic text-primary/70">
                  {shippingLines.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </address>
              ) : (
                <p className="mt-2 text-sm text-primary/50">-</p>
              )}
            </div>
          </div>

          {(order.purchaseOrderNumber || order.customerNotes) && (
            <div className="rounded-none border bg-white p-5 text-sm">
              {order.purchaseOrderNumber && (
                <p>
                  <span className="font-medium">
                    {locale === 'de' ? 'Bestellnummer: ' : 'PO number: '}
                  </span>
                  {order.purchaseOrderNumber}
                </p>
              )}
              {order.customerNotes && (
                <p className="mt-2">
                  <span className="font-medium">{locale === 'de' ? 'Anmerkungen: ' : 'Notes: '}</span>
                  {order.customerNotes}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-none border bg-white p-5">
          <h2 className="text-lg font-semibold">{locale === 'de' ? 'Rechnung' : 'Invoice'}</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>{locale === 'de' ? 'Rechnungsnummer' : 'Invoice number'}</dt>
              <dd>{order.invoice?.invoiceNumber || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{locale === 'de' ? 'Fällig am' : 'Due date'}</dt>
              <dd>
                {order.invoice?.dueDate
                  ? new Date(order.invoice.dueDate).toLocaleDateString(
                      locale === 'de' ? 'de-DE' : 'en-GB',
                    )
                  : '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>{locale === 'de' ? 'Netto' : 'Net'}</dt>
              <dd>{formatEuro(order.invoice?.netAmount || 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                {locale === 'de'
                  ? `MwSt. (${order.invoice?.vatRate || 0}%)`
                  : `VAT (${order.invoice?.vatRate || 0}%)`}
              </dt>
              <dd>{formatEuro(order.invoice?.vatAmount || 0)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>{locale === 'de' ? 'Gesamt' : 'Total'}</dt>
              <dd>{formatEuro(order.invoice?.grossAmount || order.amount || 0)}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t pt-4 text-sm">
            <p className="font-medium">
              {order.invoice?.paidAt
                ? locale === 'de'
                  ? 'Zahlung eingegangen'
                  : 'Payment received'
                : locale === 'de'
                  ? 'Zahlung ausstehend'
                  : 'Payment pending'}
            </p>
            {order.invoice?.paidAt && (
              <p className="mt-1 text-primary/60">
                {new Date(order.invoice.paidAt).toLocaleDateString(
                  locale === 'de' ? 'de-DE' : 'en-GB',
                )}
              </p>
            )}

            {!order.invoice?.paidAt && (
              <div className="mt-3 rounded-none bg-stone-50 p-3 text-primary/70">
                <p className="font-medium">{locale === 'de' ? 'Bankverbindung' : 'Bank details'}</p>
                <p className="mt-1">{order.invoice?.bankAccountHolder || '-'}</p>
                <p>{order.invoice?.bankName || '-'}</p>
                <p>IBAN: {order.invoice?.iban || '-'}</p>
                <p>BIC: {order.invoice?.bic || '-'}</p>
                <p className="mt-2">
                  {locale === 'de' ? 'Verwendungszweck: ' : 'Payment reference: '}
                  {order.invoice?.paymentReference || order.invoice?.invoiceNumber || '-'}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
