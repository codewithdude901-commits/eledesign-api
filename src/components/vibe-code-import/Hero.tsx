'use client'

import type { HomePage } from '@/payload-types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type HeroProps = {
  hero?: HomePage['hero']
  locale?: 'de' | 'en'
}

export const Hero = ({ hero }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const slides = hero?.slides ?? []

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0)
      return
    }

    if (currentIndex >= slides.length) {
      setCurrentIndex(0)
    }
  }, [slides.length, currentIndex])

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return

    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return

    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  /*
   * Automatic slide rotation (uninterrupted continuous playback)
   */
  useEffect(() => {
    if (slides.length === 0) return

    timerRef.current = setInterval(nextSlide, 5000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [slides.length, nextSlide])

  if (slides.length === 0) return null

  const currentSlide = slides[currentIndex]
  if (!currentSlide) return null

  // Extract Desktop Image
  const desktopImg = currentSlide.image
  const rawDesktopUrl = typeof desktopImg === 'string' ? desktopImg : (desktopImg?.url ?? '')
  const desktopUrl = rawDesktopUrl ? encodeURI(rawDesktopUrl) : ''

  // Extract Mobile Image (fallback to Desktop Image if not provided)
  const mobileImg = currentSlide.mobileImage
  const rawMobileUrl = typeof mobileImg === 'string' ? mobileImg : (mobileImg?.url ?? desktopUrl)
  const mobileUrl = rawMobileUrl ? encodeURI(rawMobileUrl) : desktopUrl

  return (
    <section className="relative w-full overflow-hidden select-none aspect-4/5 sm:aspect-video max-h-[92vh]">
      {/* =========================================================
          SLIDES
          ========================================================= */}

      <div className="absolute inset-0 z-0 bg-stone-900">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentSlide.id ?? currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image Container with Zoom */}
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 6,
                ease: 'easeOut',
              }}
              className="absolute inset-0 h-full w-full"
            >
              {desktopUrl && (
                <picture className="block h-full w-full">
                  {/* Mobile Image Source */}
                  {mobileUrl && <source media="(max-width: 639px)" srcSet={mobileUrl} />}
                  {/* Desktop / Fallback Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={desktopUrl}
                    alt={currentSlide.title ?? ''}
                    className="h-full w-full object-cover"
                  />
                </picture>
              )}
            </motion.div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/20 to-black/10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================
          DESKTOP NAVIGATION
          ========================================================= */}

      <div className="hidden md:block">
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-3 text-white backdrop-blur-md transition-all hover:bg-white/15 focus:outline-none cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-3 text-white backdrop-blur-md transition-all hover:bg-white/15 focus:outline-none cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* =========================================================
          INDICATOR DOTS
          ========================================================= */}

      <div className="absolute bottom-3 md:bottom-8 left-0 right-0 z-20 flex justify-center gap-2.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id ?? index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 md:h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
              index === currentIndex
                ? 'w-8 bg-white/90'
                : 'w-2 md:w-2.5 bg-white/35 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
