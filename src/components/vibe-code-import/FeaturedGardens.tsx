'use client'

import type { HomePage, Product } from '@/payload-types'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Sprout } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Price } from '../Price'

interface FeaturedGardensProps {
  featuredGardens: HomePage['featuredProducts']
  locale: 'de' | 'en'
}

export const FeaturedGardens: React.FC<FeaturedGardensProps> = ({ featuredGardens, locale }) => {
  if (!featuredGardens) return null

  // Only keep populated Product relationships
  const products =
    featuredGardens.products?.filter(
      (product): product is Product => typeof product !== 'string',
    ) ?? []

  if (products.length === 0) return null

  /**
   * Get the first image from:
   *
   * gallery: [
   *   {
   *     image: Media | string
   *   }
   * ]
   */
  const getProductImage = (product: Product): string => {
    const firstGalleryItem = product.gallery?.[0]

    if (!firstGalleryItem?.image) return ''

    const image = firstGalleryItem.image

    if (typeof image === 'string') {
      return image
    }

    return image.url ?? ''
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* -------------------------------- */}
        {/* Section Header */}
        {/* -------------------------------- */}

        <div className="mb-12 flex flex-col justify-between md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            {/* Subtitle */}
            {featuredGardens.sub_title && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-4 inline-flex items-center gap-2 bg-green-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm"
              >
                <Sprout strokeWidth={1.5} className="h-4.5 w-4.5" />

                <span>{featuredGardens.sub_title}</span>
              </motion.div>
            )}

            {/* Title */}
            {featuredGardens.title && (
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-3xl font-extrabold leading-tight tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl text-stone-900"
              >
                {featuredGardens.title}
              </motion.h2>
            )}

            {/* Description */}
            {featuredGardens.description && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-3 text-base leading-relaxed text-black/90 sm:text-lg"
              >
                {featuredGardens.description}
              </motion.p>
            )}
          </div>

          {/* Desktop "View all" */}
          <Link
            href={`/${locale === 'en' ? 'en/' : ''}gardens`}
            className="group mt-6 inline-flex shrink-0 items-center gap-2 text-sm font-bold md:mt-0"
          >
            <span>{locale === 'de' ? 'Alle Konzepte ansehen' : 'View All Concepts'}</span>

            <ArrowRight className="h-4.5 w-4.5 transform transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* -------------------------------- */}
        {/* Product Grid */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
          {products.map((garden, index) => {
            const imageUrl = getProductImage(garden)

            return (
              <motion.article
                key={garden.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                className="group flex flex-col overflow-hidden border border-brand-charcoal/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* -------------------------------- */}
                {/* Image */}
                {/* -------------------------------- */}

                <Link
                  href={`/${locale === 'en' ? 'en/' : ''}products/${garden.slug}`}
                  className="block"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-brand-charcoal/5">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={garden.title ?? ''}
                        className="h-full w-full object-cover "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-charcoal/5">
                        <Sprout className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* -------------------------------- */}
                {/* Content */}
                {/* -------------------------------- */}

                <div className="flex grow flex-col justify-between p-4 pb-6">
                  <div>
                    {/* Product title */}
                    <Link href={`/${locale === 'en' ? 'en/' : ''}products/${garden.slug}`}>
                      <h3 className="text-xl font-bold">{garden.common_name}</h3>
                    </Link>

                    {/* Description */}
                    {garden.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-black/90">
                        {garden.description}
                      </p>
                    )}

                    {/* Garden attributes */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {garden.maintenance_level_garden_set && (
                        <span className="border border-brand-charcoal/10 bg-brand-charcoal/5 px-2.5 py-1 text-xs font-medium capitalize bg-emerald-200/50 ">
                          {locale === 'de' ? 'Pflegebedarf' : 'Maintenance'} :{' '}
                          {garden.maintenance_level_garden_set}
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

                  {/* -------------------------------- */}
                  {/* Footer */}
                  {/* -------------------------------- */}

                  <div className="mt-5 flex items-center justify-between border-t border-brand-charcoal/20 pt-4 text-sm">
                    {typeof garden.priceInEUR === 'number' && (
                      <span className="font-semibold flex gap-2">
                        {locale === 'de' ? 'Ab' : 'From'} <Price amount={garden.priceInEUR} />
                      </span>
                    )}

                    <Link
                      href={`/${locale === 'en' ? 'en/' : ''}products/${garden.slug}`}
                      className="group/btn flex items-center gap-1 font-sans font-bold"
                    >
                      <span>{locale === 'de' ? 'Details' : 'Details'}</span>

                      <ChevronRight className="h-4 w-4 transform transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* -------------------------------- */}
        {/* Bottom CTA */}
        {/* -------------------------------- */}

        <div className="mt-14 text-center">
          <Link
            href={`/${locale === 'en' ? 'en/' : ''}gardens`}
            className="group inline-flex items-center gap-3 bg-green-700 px-8 py-4 font-sans text-sm font-bold tracking-wide text-white shadow-md transition-all hover:shadow-lg"
          >
            <span>
              {locale === 'de' ? 'Alle Gartenkonzepte entdecken' : 'Explore All Garden Concepts'}
            </span>

            <ArrowRight className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
