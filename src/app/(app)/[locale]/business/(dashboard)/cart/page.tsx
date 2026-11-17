import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { BusinessCart } from '@/components/business/BusinessCart'
import type { B2BSetting } from '@/payload-types'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessCartPage({ params }: Props) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    depth: 0,
    overrideAccess: true,
    slug: 'b2b-settings',
  })) as B2BSetting

  return (
    <BusinessCart
      locale={locale}
      vatRatePercent={Number(settings.vatRatePercent ?? 19)}
    />
  )
}
