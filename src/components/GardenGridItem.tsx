import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  garden: Partial<Product>
  locale: string
}

export const GardenGridItem: React.FC<Props> = ({ garden, locale }) => {
  const image =
    garden.gallery?.[0]?.image && typeof garden.gallery[0].image !== 'string'
      ? garden.gallery[0].image
      : null

  let price = garden.priceInEUR

  const variants = garden.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]

    if (variant && typeof variant === 'object' && typeof variant.priceInEUR === 'number') {
      price = variant.priceInEUR
    }
  }

  const gardenUrl = `/${locale}/products/${garden.slug}`

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
      {/* Image */}

      <Link href={gardenUrl} className="block">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-brand-charcoal/5">
          {image ? (
            <Media
              resource={image}
              fill
              className="h-full w-full"
              imgClassName="
                h-full w-full object-cover
                
              "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-charcoal/5">
              <span className="text-sm text-brand-charcoal/40">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}

      <div className="flex grow flex-col justify-between p-4 pb-6">
        <div>
          {/* Title */}

          <Link href={gardenUrl}>
            <h3 className="text-xl font-bold text-brand-charcoal">
              {garden.common_name ?? garden.title ?? ''}
            </h3>
          </Link>

          {/* Description */}

          {garden.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-black/90">
              {garden.description}
            </p>
          )}

          {/* Attributes */}

          <div className="mt-4 flex flex-wrap gap-2">
            {garden.maintenance_level_garden_set && (
              <span className="border border-brand-charcoal/10 bg-emerald-200/50 px-2.5 py-1 text-xs font-medium capitalize">
                {locale === 'de' ? 'Pflegebedarf' : 'Maintenance'} :{' '}
                {garden.maintenance_level_garden_set === 'high'
                  ? 'I Love Gardening'
                  : garden.maintenance_level_garden_set}
              </span>
            )}

            {garden.style_tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="border border-brand-charcoal/10 bg-brand-charcoal/5 px-2.5 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}

        <div className="mt-5 flex items-center justify-between border-t border-brand-charcoal/20 pt-4 text-sm ">
          {typeof price === 'number' && (
            <span className="font-semibold flex gap-2">
              {locale === 'de' ? 'Ab' : 'From'} <Price amount={price} />
            </span>
          )}

          <Link href={gardenUrl} className="group/btn flex items-center gap-1 font-sans font-bold">
            <span>Details</span>

            <ChevronRight className="h-4 w-4 transform transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
