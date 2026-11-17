import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { getStyleTagLabel } from '@/lib/constants'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  locale: 'de' | 'en'
  price: null | number
  product: Partial<Product>
}

export const BusinessProductCard: React.FC<Props> = ({ locale, price, product }) => {
  const image =
    product.gallery?.[0]?.image && typeof product.gallery[0].image !== 'string'
      ? product.gallery[0].image
      : null

  const productUrl = `/${locale}/business/catalog/${product.slug}`

  return (
    <article
      className="
        group flex h-full flex-col overflow-hidden
        border border-brand-charcoal/10
        bg-white shadow-sm
        transition-all duration-500
        hover:-translate-y-0.5 hover:shadow-lg
      "
    >
      <Link className="block" href={productUrl}>
        <div className="relative aspect-4/3 w-full overflow-hidden bg-brand-charcoal/5">
          {image ? (
            <Media
              className="relative h-full w-full"
              fill
              imgClassName="h-full w-full object-cover"
              resource={image}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-charcoal/5">
              <span className="text-sm text-brand-charcoal/40">
                {locale === 'de' ? 'Kein Bild' : 'No image'}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex grow flex-col justify-between p-4 pb-6">
        <div>
          <Link href={productUrl}>
            <h3 className="text-xl font-bold text-brand-charcoal">
              {product.common_name ?? product.title ?? ''}
            </h3>
          </Link>

          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
            {product.sku}
          </p>

          {product.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-black/90">
              {product.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {product.maintenance_level_garden_set && (
              <span className="border border-brand-charcoal/10 bg-emerald-200/50 px-2.5 py-1 text-xs font-medium capitalize">
                {locale === 'de' ? 'Pflegebedarf' : 'Maintenance'}:{' '}
                {product.maintenance_level_garden_set === 'high'
                  ? locale === 'de'
                    ? 'Ich liebe die Gartenarbeit.'
                    : 'I Love Gardening'
                  : locale === 'de'
                    ? 'Niedrig'
                    : 'Low'}
              </span>
            )}

            {product.style_tags?.slice(0, 2).map((tag) => (
              <span
                className="border border-brand-charcoal/10 bg-brand-charcoal/5 px-2.5 py-1 text-xs font-medium"
                key={tag}
              >
                {getStyleTagLabel(tag, locale)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-brand-charcoal/20 pt-4 text-sm">
          {price != null ? (
            <span className="flex gap-2 font-semibold">
              {locale === 'de' ? 'Ab' : 'From'} <Price amount={price} />
            </span>
          ) : (
            <span className="text-xs text-brand-charcoal/40">
              {locale === 'de' ? 'Kein B2B-Preis' : 'No B2B price'}
            </span>
          )}

          <Link className="group/btn flex items-center gap-1 font-sans font-bold" href={productUrl}>
            <span>{locale === 'de' ? 'Details' : 'Details'}</span>
            <ChevronRight className="h-4 w-4 transform transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
