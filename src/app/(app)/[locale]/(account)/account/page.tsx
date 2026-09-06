import type { Metadata } from 'next'

import { AccountForm } from '@/components/forms/AccountForm'
import { OrderItem } from '@/components/OrderItem'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function AccountPage({ params }: Props) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const { locale } = await params
  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/${locale}/login?warning=${encodeURIComponent(locale === 'de' ? 'Bitte melden Sie sich an, um auf Ihre Kontoeinstellungen zuzugreifen.' : 'Please login to access your account settings.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {
    // when deploying this template on Payload Cloud, this page needs to build before the APIs are live
    // so swallow the error here and simply render the page with fallback data where necessary
    // in production you may want to redirect to a 404  page or at least log the error somewhere
    // console.error(error)
  }

  return (
    <>
      <div className="border p-8  bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8">
          {locale === 'de' ? 'Kontoeinstellungen' : 'Account settings'}
        </h1>
        <AccountForm locale={locale} />
      </div>

      <div className=" border p-8  bg-primary-foreground">
        <h2 className="text-3xl font-medium mb-8">
          {locale === 'de' ? 'Letzte Bestellungen' : 'Recent Orders'}
        </h2>

        <div className="prose dark:prose-invert mb-8">
          <p>
            {locale === 'de'
              ? 'Dies sind die zuletzt von Ihnen aufgegebenen Bestellungen. Jede Bestellung ist mit einer Zahlung verknüpft. Wenn Sie weitere Bestellungen aufgeben, erscheinen diese in Ihrer Bestellliste.'
              : 'These are the most recent orders you have placed. Each order is associated with an payment. As you place more orders, they will appear in your orders list.'}
          </p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="mb-8">
            {locale === 'de'
              ? 'Sie haben noch keine Bestellungen aufgegeben.'
              : 'You have no orders.'}
          </p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6 mb-8">
            {orders?.map((order, index) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="default" className='rounded-none'>
          <Link href="/orders">
            {locale === 'de' ? 'Alle Bestellungen ansehen' : 'View all orders'}
          </Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
