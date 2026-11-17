import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PrintInvoiceButton } from '@/components/business/PrintInvoiceButton'
import type { Address, Order, User } from '@/payload-types'
import { formatEuro } from '@/b2b/utilities/pricing'

type Props = {
  params: Promise<{
    id: string
    locale: 'de' | 'en'
  }>
}

const addressLines = (address?: null | Partial<Address>) => {
  if (!address) return []
  return [
    address.company,
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.addressLine1,
    address.addressLine2,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.country,
  ].filter(Boolean) as string[]
}

export default async function BusinessInvoicePage({ params }: Props) {
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

  const invoice = order.invoice || {}
  const billing = addressLines(order.billingAddress as Partial<Address>)
  const shipping = addressLines(order.shippingAddress as Partial<Address>)

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 text-stone-900">
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; }
          main { margin: 0 !important; }
        }
      `}</style>

      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-2xl font-semibold">eledesign</p>
          <p className="text-sm text-stone-500">
            {locale === 'de' ? 'Geschäftskundenrechnung' : 'Business invoice'}
          </p>
        </div>
        <PrintInvoiceButton
          label={locale === 'de' ? 'Rechnung drucken' : 'Print invoice'}
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h1 className="text-xl font-semibold">
            {locale === 'de' ? 'Rechnung' : 'Invoice'} {invoice.invoiceNumber || order.id}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {locale === 'de' ? 'Bestelldatum' : 'Order date'}:{' '}
            {new Date(order.createdAt).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB')}
          </p>
          <p className="text-sm text-stone-600">
            {locale === 'de' ? 'Fällig am' : 'Due date'}:{' '}
            {invoice.dueDate
              ? new Date(invoice.dueDate).toLocaleDateString(
                  locale === 'de' ? 'de-DE' : 'en-GB',
                )
              : '-'}
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold">{locale === 'de' ? 'Rechnungsempfänger' : 'Bill to'}</p>
          {billing.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
          {order.companySnapshot?.vatId && (
            <p className="mt-1">{locale === 'de' ? 'USt-IdNr.' : 'VAT ID'}: {order.companySnapshot.vatId}</p>
          )}
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-stone-100">
            <th className="p-2">{locale === 'de' ? 'Position' : 'Item'}</th>
            <th className="p-2">{locale === 'de' ? 'Menge' : 'Qty'}</th>
            <th className="p-2">{locale === 'de' ? 'Einzelpreis netto' : 'Unit price net'}</th>
            <th className="p-2">{locale === 'de' ? 'Summe netto' : 'Line total net'}</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, index) => (
            <tr className="border-b" key={item.id || item.product_name || index}>
              <td className="p-2">{item.product_name || '-'}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{formatEuro(item.unitPrice || 0)}</td>
              <td className="p-2">{formatEuro(item.lineTotal || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto max-w-xs text-sm">
        <div className="flex justify-between border-b py-1">
          <span>{locale === 'de' ? 'Netto' : 'Net'}</span>
          <span>{formatEuro(invoice.netAmount || 0)}</span>
        </div>
        <div className="flex justify-between border-b py-1">
          <span>
            {locale === 'de' ? 'MwSt.' : 'VAT'} {invoice.vatRate || 0}%
          </span>
          <span>{formatEuro(invoice.vatAmount || 0)}</span>
        </div>
        <div className="flex justify-between py-2 text-base font-semibold">
          <span>{locale === 'de' ? 'Gesamt' : 'Total'}</span>
          <span>{formatEuro(invoice.grossAmount || order.amount || 0)}</span>
        </div>
      </div>

      <div className="mt-10 grid gap-8 border-t pt-6 text-sm sm:grid-cols-2">
        <div>
          <p className="font-semibold">{locale === 'de' ? 'Bankverbindung' : 'Bank details'}</p>
          <p>{invoice.bankAccountHolder || '-'}</p>
          <p>{invoice.bankName || '-'}</p>
          <p>IBAN: {invoice.iban || '-'}</p>
          <p>BIC: {invoice.bic || '-'}</p>
          <p className="mt-2">
            {locale === 'de' ? 'Verwendungszweck' : 'Payment reference'}:{' '}
            {invoice.paymentReference || invoice.invoiceNumber || '-'}
          </p>
        </div>

        {shipping.length > 0 && (
          <div>
            <p className="font-semibold">{locale === 'de' ? 'Lieferadresse' : 'Ship to'}</p>
            {shipping.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </div>
        )}
      </div>

      {order.customerNotes && (
        <p className="mt-6 text-sm text-stone-600">
          {locale === 'de' ? 'Anmerkungen' : 'Notes'}: {order.customerNotes}
        </p>
      )}

      {invoice.footerText && (
        <p className="mt-8 border-t pt-4 text-xs text-stone-500">{invoice.footerText}</p>
      )}
    </div>
  )
}
