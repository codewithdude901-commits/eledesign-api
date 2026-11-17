import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { BusinessProductDetail } from '@/components/business/BusinessProductDetail'
import type { Product, User } from '@/payload-types'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
    slug: string
  }>
}

export default async function BusinessCatalogProductPage({ params }: Props) {
  const { locale, slug } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    limit: 1,
    locale,
    overrideAccess: false,
    pagination: false,
    user: businessUser,
    where: {
      _status: {
        equals: 'published',
      },
      b2bPriceInEUR: {
        exists: true,
      },
      product_status: {
        equals: 'active',
      },
      slug: {
        equals: slug,
      },
    },
    populate: {
      variants: {
        b2bMinOrderQuantity: true,
        b2bPriceInEUR: true,
        inventory: true,
        options: true,
        priceInEUR: true,
        title: true,
      },
    },
  })

  const product = result.docs?.[0] as Product | undefined

  if (!product) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        className="text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
        href={`/${locale}/business/catalog`}
      >
        {locale === 'de' ? 'Zurück zum Katalog' : 'Back to catalog'}
      </Link>

      <BusinessProductDetail
        discountPercent={businessUser.b2b?.discountPercent || 0}
        locale={locale}
        product={product}
      />
    </div>
  )
}
