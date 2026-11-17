import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { BusinessCheckout } from '@/components/business/BusinessCheckout'
import type { B2BSetting } from '@/payload-types'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessCheckoutPage({ params }: Props) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    depth: 0,
    overrideAccess: true,
    slug: 'b2b-settings',
  })) as B2BSetting

  return (
    <BusinessCheckout
      locale={locale}
      termsUrl={settings.termsUrl}
      vatRatePercent={Number(settings.vatRatePercent ?? 19)}
    />
  )
}
