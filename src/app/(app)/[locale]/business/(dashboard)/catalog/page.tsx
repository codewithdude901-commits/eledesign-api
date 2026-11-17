import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import { BusinessProductCard } from '@/components/business/BusinessProductCard'
import { resolveB2BUnitPrice } from '@/b2b/utilities/pricing'
import type { Product, User } from '@/payload-types'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
  searchParams: Promise<{
    page?: string
    q?: string
  }>
}

export default async function BusinessCatalogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User

  const where = {
    _status: { equals: 'published' },
    product_status: { equals: 'active' },
    b2bPriceInEUR: { exists: true },
    ...(q
      ? {
          or: [
            { title: { contains: q } },
            { common_name: { contains: q } },
            { sku: { contains: q } },
            { botanical_name: { contains: q } },
          ],
        }
      : {}),
  } as never

  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 24,
    locale,
    overrideAccess: false,
    page,
    user: businessUser,
    where,
  })

  const products = result.docs as Product[]
  const discount = businessUser.b2b?.discountPercent || 0
  const totalPages = result.totalPages || 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{locale === 'de' ? 'B2B-Katalog' : 'B2B catalog'}</h1>
          <p className="mt-1 text-sm text-primary/60">
            {locale === 'de'
              ? 'Nettopreise zzgl. MwSt. Ihr Partnernachlass wird bereits berücksichtigt.'
              : 'Net prices excl. VAT. Your partner discount is already included.'}
          </p>
        </div>

        <form className="flex gap-2" method="get">
          <input
            className="h-9 rounded-none border px-3 text-sm"
            defaultValue={q || ''}
            name="q"
            placeholder={locale === 'de' ? 'Produkt suchen...' : 'Search products...'}
          />
          <button className="rounded-none bg-stone-900 px-4 text-sm font-medium text-white" type="submit">
            {locale === 'de' ? 'Suchen' : 'Search'}
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="rounded-none border bg-white p-8 text-sm text-primary/60">
          {locale === 'de'
            ? 'Keine B2B-Produkte gefunden. Bitte sprechen Sie uns an, wenn Sie Produkte freischalten möchten.'
            : 'No B2B products found. Contact us if you need products enabled.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            let price: null | number = null

            try {
              price = resolveB2BUnitPrice({
                discountPercent: discount,
                product,
              })
            } catch {
              price = null
            }

            return (
              <BusinessProductCard
                key={product.id}
                locale={locale}
                price={price}
                product={product}
              />
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              className="rounded-none border px-4 py-2 text-sm hover:bg-stone-100"
              href={`/${locale}/business/catalog?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
              href={`/${locale}/business/catalog?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            >
              {locale === 'de' ? 'Weiter' : 'Next'}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
