'use client'

import type { HomePage } from '@/payload-types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type HeroProps = {
  hero?: HomePage['hero']
  locale?: 'de' | 'en'
}

export const Hero = ({ hero, locale }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  /*
   * Payload can return slides as:
   *
   * undefined
   * null
   * []
   * [...]
   *
   * Normalize everything to an array.
   */
  const slides = hero?.slides ?? []

  /*
   * Keep currentIndex valid if the number of slides
   * changes after the component has rendered.
   */
  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0)
      return
    }

    if (currentIndex >= slides.length) {
      setCurrentIndex(0)
    }
  }, [slides.length, currentIndex])

  /*
   * Next slide
   */
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return

    setCurrentIndex((prevIndex) => {
      return (prevIndex + 1) % slides.length
    })
  }, [slides.length])

  /*
   * Previous slide
   */
  const prevSlide = useCallback(() => {
    if (slides.length === 0) return

    setCurrentIndex((prevIndex) => {
      return (prevIndex - 1 + slides.length) % slides.length
    })
  }, [slides.length])

  /*
   * Automatic slide rotation.
   *
   * Pauses while the user hovers over the hero.
   */
  useEffect(() => {
    if (slides.length === 0 || isHovered) {
      return
    }

    timerRef.current = setInterval(nextSlide, 6000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [slides.length, isHovered, nextSlide])

  /*
   * No slides configured.
   */
  if (slides.length === 0) {
    return null
  }

  const currentSlide = slides[currentIndex]

  if (!currentSlide) {
    return null
  }

  /*
   * Payload upload relationship can be either:
   *
   * string
   * or
   * populated Media object
   */
  const image = currentSlide.image

  const imageUrl = typeof image === 'string' ? image : (image.url ?? '')

  /*
   * Get the actual image dimensions from Payload.
   *
   * Example:
   *
   * width  = 1920
   * height = 800
   *
   * aspectRatio = 1920 / 800
   */
  const imageWidth = typeof image === 'string' ? undefined : image.width

  const imageHeight = typeof image === 'string' ? undefined : image.height

  /*
   * Use the actual image aspect ratio when Payload
   * has width/height available.
   *
   * Fall back to 16:9 when the relationship isn't populated.
   */
  const aspectRatio = imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : '16 / 9'

  return (
    <section
      className="relative w-full overflow-hidden select-none max-h-[92vh]"
      style={{ aspectRatio }}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
    >
      {/* =========================================================
          SLIDES
          ========================================================= */}

      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide.id ?? currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.6,
                ease: 'easeInOut',
              },
            }}
            className="absolute inset-0"
          >
            {/* Image */}
            <motion.div
              initial={{
                scale: 1.05,
                rotate: 1,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 4,
                ease: 'easeOut',
              }}
              className="absolute inset-0 h-full w-full"
            >
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={currentSlide.title ?? ''}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-charcoal/20 via-brand-charcoal/30 to-brand-charcoal/10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================
          SLIDE CONTENT
          ========================================================= */}

      {/*
      <div className="absolute bottom-[20%] left-1/2 z-10 flex w-full -translate-x-1/2 justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id ?? currentIndex}
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.2,
              delay: 0.2,
            }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            {currentSlide.link && (
              <Link
                href={currentSlide.link}
                className="flex w-full items-center justify-center gap-2 bg-green-700 px-6 py-3.5 text-base font-semibold text-brand-cream shadow-lg sm:w-auto"
              >
                <span>
                  {currentSlide.title}
                </span>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      */}

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
