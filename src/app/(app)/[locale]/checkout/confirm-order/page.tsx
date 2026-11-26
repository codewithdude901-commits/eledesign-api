import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}) {
  const { locale } = await params
  const searchParams = await searchParamsPromise

  const paymentIntent = searchParams.paymentId

  return (
    <div className="container min-h-[90vh] flex py-12">
      <ConfirmOrder locale={locale} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
