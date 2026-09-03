'use client'

import React from 'react'
import { Layers, Truck, ShieldCheck, CheckCircle2, Sun, Sprout, Compass } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { HomePage } from '@/payload-types'

interface TrustBannerProps {
  trustBanner: HomePage['trustBanner']
  locale: 'de' | 'en'
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ trustBanner, locale }) => {
  if (!trustBanner?.cards) return null
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  }

  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header matching PathSelector and FeaturedGardens */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5  bg-green-500/30 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{trustBanner?.sub_title}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-charcoal tracking-tight leading-tight"
          >
            {trustBanner?.title}
          </motion.h2>

          <p className="text-black/90 mt-3 text-base sm:text-lg leading-relaxed max-w-2xl">
            {trustBanner?.description}
          </p>
        </div>

        {/* Clean 3-Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* CARD 1: Architectural Design Structure */}
          <motion.div
            variants={cardVariants}
            className="bg-white border border-brand-charcoal/10  p-6 sm:px-5 sm:p-8 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="p-3.5  bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1  text-emerald-800 bg-emerald-100/60 border border-emerald-200/50 text-right w-fit">
                  {trustBanner?.cards[0]?.sub_title}
                </span>
              </div>

              {/* Core Title & Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-charcoal">
                  {trustBanner?.cards[0]?.title}
                </h3>
                <p className="text-sm text-brand-charcoal/80 leading-relaxed font-sans">
                  {trustBanner?.cards[0]?.description}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-1">
                {trustBanner?.cards[0].list && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{trustBanner?.cards[0]?.list[0].item}</span>
                  </div>
                )}

                {trustBanner?.cards[0].list && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{trustBanner?.cards[0]?.list[1].item}</span>
                  </div>
                )}

                {trustBanner?.cards[0].list && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <Sprout className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{trustBanner?.cards[0]?.list[2].item}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* CARD 2: Nationwide DIY Delivery */}
          <motion.div
            variants={cardVariants}
            className="bg-white border border-brand-charcoal/10  p-6 sm:px-5 sm:p-8 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header Row */}
              <div className="flex gap-2 items-center justify-between">
                <div className="p-3.5  bg-amber-50 text-amber-700 border border-amber-100">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1  text-amber-900 bg-amber-100/60 border border-amber-200/50">
                  {trustBanner?.cards[1]?.sub_title}
                </span>
              </div>

              {/* Core Title & Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-charcoal">
                  {trustBanner?.cards[1]?.title}
                </h3>
                <p className="text-sm text-brand-charcoal/80 leading-relaxed font-sans">
                  {trustBanner?.cards[1]?.description}
                </p>
              </div>

              {/* Logistics Route Stepper Visualizer */}
              <div className="py-4 px-3 bg-brand-cream/50  border border-brand-charcoal/10 flex justify-between items-center text-xs font-bold text-brand-charcoal relative">
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-7 h-7  bg-white border-2 border-green-700 flex items-center justify-center text-green-700 shadow-xs rounded-full">
                    1
                  </div>
                  <span>{locale === 'de' ? 'Fracht' : 'Freight'}</span>
                </div>
                <div className="flex-1 h-0.5 bg-brand-charcoal/15 mx-2 -mt-4 relative ">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5  bg-green-600 rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-7 h-7  bg-white border-2 border-green-700 flex items-center justify-center text-green-700 shadow-xs rounded-full">
                    2
                  </div>
                  <span>{locale === 'de' ? 'Route' : 'Route'}</span>
                </div>
                <div className="flex-1 h-0.5 bg-brand-charcoal/15 mx-2 -mt-4 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5  bg-green-600 rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-7 h-7  bg-white border-2 border-green-700 flex items-center justify-center text-green-700 shadow-xs rounded-full">
                    3
                  </div>
                  <span>{locale === 'de' ? 'Blueprint' : 'Blueprint'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: 100% Plant Survival Guarantee */}
          <motion.div
            variants={cardVariants}
            className="bg-white border border-brand-charcoal/10  p-6 sm:p-8 sm:px-5 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header Row */}
              <div className="flex gap-2 items-center justify-between">
                <div className="p-3.5  bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1  text-blue-900 bg-blue-100/60 border border-blue-200/50">
                  {trustBanner?.cards[2]?.sub_title}
                </span>
              </div>

              {/* Core Title & Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-charcoal">
                  {trustBanner?.cards[2]?.title}
                </h3>
                <p className="text-sm text-brand-charcoal/80 leading-relaxed font-sans">
                  {trustBanner?.cards[2]?.description}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-1">
                {trustBanner?.cards[2]?.list && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{trustBanner?.cards[2]?.list[0].item}</span>
                  </div>
                )}

                {trustBanner?.cards[2]?.list && trustBanner?.cards[2]?.list[1] && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{trustBanner?.cards[2]?.list[1].item}</span>
                  </div>
                )}

                {trustBanner?.cards[2]?.list && trustBanner?.cards[2]?.list[1] && (
                  <div className="flex items-center gap-2.5 text-sm font-medium text-brand-charcoal/90">
                    <Sprout className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{trustBanner?.cards[2]?.list[2].item}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
