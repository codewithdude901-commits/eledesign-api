import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import { BusinessOrderStatus } from '@/components/business/BusinessOrderStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order, User } from '@/payload-types'
import { formatEuro } from '@/b2b/utilities/pricing'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessDashboardPage({ params }: Props) {
  const { locale } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User

  const ordersResult = await payload.find({
    collection: 'orders',
    depth: 0,
    limit: 100,
    overrideAccess: false,
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

  const orders = ordersResult.docs as Order[]
  const activeOrders = orders.filter(
    (order) => order.b2bStatus !== 'completed' && order.b2bStatus !== 'cancelled',
  )
  const awaitingPayment = orders.filter((order) => order.b2bStatus === 'awaiting_payment')
  const outstanding = awaitingPayment.reduce(
    (sum, order) => sum + (order.invoice?.grossAmount ?? order.amount ?? 0),
    0,
  )
  const year = new Date().getFullYear()
  const ordersThisYear = orders.filter(
    (order) => new Date(order.createdAt).getFullYear() === year,
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">
          {locale === 'de' ? 'Geschäftskunden-Übersicht' : 'Business dashboard'}
        </h1>
        <p className="mt-1 text-sm text-primary/60">
          {businessUser.b2b?.companyName || businessUser.name || businessUser.email}
          {businessUser.b2b?.vatId ? ` · ${businessUser.b2b.vatId}` : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/60">
              {locale === 'de' ? 'Offene Bestellungen' : 'Open orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeOrders.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/60">
              {locale === 'de' ? 'Zahlung ausstehend' : 'Awaiting payment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{awaitingPayment.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/60">
              {locale === 'de' ? 'Offene Rechnungen' : 'Outstanding invoices'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatEuro(outstanding)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary/60">
              {locale === 'de' ? `Bestellungen ${year}` : `Orders ${year}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{ordersThisYear.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-none bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          href={`/${locale}/business/catalog`}
        >
          {locale === 'de' ? 'Katalog öffnen' : 'Open catalog'}
        </Link>
        <Link
          className="rounded-none border px-4 py-2 text-sm font-medium hover:bg-stone-100"
          href={`/${locale}/business/orders`}
        >
          {locale === 'de' ? 'Alle Bestellungen' : 'All orders'}
        </Link>
      </div>

      <div className="rounded-none border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">
            {locale === 'de' ? 'Letzte Bestellungen' : 'Recent orders'}
          </h2>
        </div>

        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-primary/60">
            {locale === 'de' ? 'Noch keine Bestellungen.' : 'No orders yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase tracking-wide text-primary/50">
                <tr>
                  <th className="px-5 py-3">{locale === 'de' ? 'Bestellung' : 'Order'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Datum' : 'Date'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Betrag' : 'Amount'}</th>
                  <th className="px-5 py-3">{locale === 'de' ? 'Status' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr className="border-b last:border-none" key={order.id}>
                    <td className="px-5 py-3">
                      <Link
                        className="font-medium underline-offset-4 hover:underline"
                        href={`/${locale}/business/orders/${order.id}`}
                      >
                        {order.invoice?.invoiceNumber || order.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {new Date(order.createdAt).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'en-GB',
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {formatEuro(order.invoice?.grossAmount ?? order.amount ?? 0)}
                    </td>
                    <td className="px-5 py-3">
                      <BusinessOrderStatus locale={locale} status={order.b2bStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
