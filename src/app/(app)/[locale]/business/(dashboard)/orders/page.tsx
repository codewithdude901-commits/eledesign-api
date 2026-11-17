import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import { BusinessOrderStatus } from '@/components/business/BusinessOrderStatus'
import type { Order, User } from '@/payload-types'
import { formatEuro } from '@/b2b/utilities/pricing'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function BusinessOrdersPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User

  const result = await payload.find({
    collection: 'orders',
    depth: 0,
    limit: 20,
    overrideAccess: false,
    page,
    sort: '-createdAt',
    user: businessUser,
    where: {
      channel: {
        equals: 'b2b',
      },
      customer: {
        equals: businessUser.id,
      },
    },
  })

  const orders = result.docs as Order[]
  const totalPages = result.totalPages || 1

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">{locale === 'de' ? 'Bestellungen' : 'Orders'}</h1>
        <p className="mt-1 text-sm text-primary/60">
          {locale === 'de'
            ? 'Alle Bestellungen Ihres Geschäftskontos.'
            : 'All orders for your business account.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-none border bg-white">
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-primary/60">
            {locale === 'de' ? 'Noch keine Bestellungen.' : 'No orders yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase tracking-wide text-primary/50">
                <tr>
                  <th className="px-5 py-3">{locale === 'de' ? 'Rechnung' : 'Invoice'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Datum' : 'Date'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Betrag' : 'Amount'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Zahlung' : 'Payment'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Status' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr className="border-b last:border-none" key={order.id}>
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium underline-offset-4 hover:underline"
                        href={`/${locale}/business/orders/${order.id}`}
                      >
                        {order.invoice?.invoiceNumber || order.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {new Date(order.createdAt).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'en-GB',
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {formatEuro(order.invoice?.grossAmount ?? order.amount ?? 0)}
                    </td>
                    <td className="px-5 py-4">
                      {order.invoice?.paidAt
                        ? locale === 'de'
                          ? 'Bezahlt'
                          : 'Paid'
                        : locale === 'de'
                          ? 'Offen'
                          : 'Open'}
                    </td>
                    <td className="px-5 py-4">
                      <BusinessOrderStatus locale={locale} status={order.b2bStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              className="rounded-none border px-4 py-2 text-sm hover:bg-stone-100"
              href={`/${locale}/business/orders?page=${page - 1}`}
            >
              {locale === 'de' ? 'Zurück' : 'Previous'}
            </Link>
          )}
          <span className="text-sm text-primary/60">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              className="rounded-none border px-4 py-2 text-sm hover:bg-stone-100"
              href={`/${locale}/business/orders?page=${page + 1}`}
            >
              {locale === 'de' ? 'Weiter' : 'Next'}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
