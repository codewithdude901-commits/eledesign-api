import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function Orders({ params }: Props) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { locale } = await params

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/${locale}/login?warning=${encodeURIComponent(locale === 'de' ? 'Bitte melden Sie sich an, um auf Ihre Bestellungen zuzugreifen.' : 'Please login to access your orders.')}`,
    )
  }
  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {}

  return (
    <>
      <div className="border p-8  bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">{locale === 'de' ? 'Bestellungen' : 'Orders'}</h1>
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="">
            {locale === 'de' ? 'Sie haben noch keine Bestellungen.' : 'You have no orders.'}
          </p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6">
            {orders?.map((order, index) => (
              <li key={order.id}>
                <OrderItem order={order} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
