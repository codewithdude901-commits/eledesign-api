import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React, { Fragment } from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import type { User } from '@/payload-types'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function Checkout({ params }: Props) {
  const { locale } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if ((user as User | null)?.accountType === 'b2b') {
    redirect(`/${locale}/business/checkout`)
  }

  return (
    <div className="container min-h-[90vh] flex">
      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div>
          <Fragment>
            {'To enable checkout, you must '}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              rel="noopener noreferrer"
              target="_blank"
            >
              obtain your Stripe API Keys
            </a>
            {' then set them as environment variables. See the '}
            <a
              href="https://github.com/payloadcms/payload/blob/3.x/templates/ecommerce/README.md#stripe"
              rel="noopener noreferrer"
              target="_blank"
            >
              README
            </a>
            {' for more details.'}
          </Fragment>
        </div>
      )}

      <h1 className="sr-only">Checkout</h1>

      <CheckoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
