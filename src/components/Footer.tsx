'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, CheckCircle2, Send } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

export const Footer: React.FC = () => {
  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail('')
      setTimeout(() => setIsSubmitted(false), 5000)
    }, 1200)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer className={`pt-12 pb-12 transition-colors duration-500 border-t border-black/20`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-16">
          {/* Column 1: Brand story & Socials */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 -ml-5 -mt-5">
              <img src={'/logo.jpeg'} className="w-full max-w-40 md:max-w-52 h-auto  ml-2 md:ml-0 " />
            </div>

            <p className={`text-sm leading-relaxed max-w-sm font-medium text-brand-charcoal/90`}>
              {locale === 'de'
                ? 'Skalierbare Landschaftsgestaltungskonzepte: Wir liefern Pflanzen in Gärtnerqualität sowie detaillierte Pflanzpläne, um Ihre Wohn- und Gewerbebereiche aufzuwerten.'
                : 'Architectural landscape packages engineered to scale. We supply nursery-grade plants and detailed planting blueprints to elevate your residential and commercial environments.'}
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest `}>
              {locale === 'de' ? 'Einkaufen & Entdecken' : 'Shop & Explore'}
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { label: locale === 'de' ? 'Gartenpakete' : 'Garden Packages', href: '/gardens' },
                {
                  label: locale === 'de' ? 'AI-Konzept-Builder' : 'AI Canvas Builder',
                  href: '/ai-canvas',
                },
                { label: locale === 'de' ? 'Pflanzanleitung' : 'Planting Guide', href: '#' },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className={`transition-colors duration-200 text-brand-charcoal`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          {/* <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest`}>Support & Policies</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { label: 'Botanical Shipping Info', href: '#' },
                { label: 'Plant Guarantee & Returns', href: '#' },
                { label: '30-Day Health Warranty', href: '#' },
                { label: 'Landscape Architect FAQ', href: '#faq-section' },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className={`transition-colors duration-200 text-brand-charcoal`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Column 4: Newsletter Subscription ("Join the Green List") */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest`}>
              {locale === 'de' ? 'Schließen Sie sich der Green List an' : 'Join the Green List'}
            </h4>
            <p className={`text-xs leading-relaxed font-medium text-brand-charcoal`}>
              {locale === 'de'
                ? 'Erhalten Sie wöchentliche Protokolle zur Pflanzenpflege, Veröffentlichungen von Bauplänen für modulare Layouts sowie exklusive Rabatte für das gewerbliche Fachhandelsportal.'
                : ' Receive weekly botanical care logs, modular layout blueprint releases, and exclusive commercial trade portal discounts.'}
            </p>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex items-center"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale === 'de' ? 'Ihre E-Mail-Adresse' : 'Your email address'}
                    required
                    className={`w-full text-xs p-3.5 pr-12  border transition-all duration-300 outline-none bg-white border-brand-charcoal/20 focus:border-brand-forest text-brand-charcoal placeholder-brand-charcoal/70`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="Subscribe"
                    className={`absolute right-2 p-2  cursor-pointer transition-all bg-brand-forest hover:bg-brand-forest-light text-white`}
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent  animate-spin block" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="subscribe-success"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={`flex items-center gap-2 p-3.5  border text-xs font-semibold bg-brand-forest/5 border-brand-forest/15 text-brand-forest`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {locale === 'de' ? 'Erfolgreich abonniert!' : 'Subscribed successfully!'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6 border-brand-charcoal/20 text-brand-charcoal/90`}
        >
          {/* Copyright Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <span>
              © {new Date().getFullYear()} EleDesigns.{' '}
              {locale === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
            </span>
            {/* <span className="opacity-50">•</span> */}

            <div className="flex items-center gap-1">
              <span>{locale === 'de' ? 'Datenschutz' : 'Privacy Policy'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{locale === 'de' ? 'Impressum' : 'Imprint'}</span>
            </div>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none text-brand-charcoal/90 `}
          >
            <span>{locale === 'de' ? 'Zurück nach oben' : 'Back to top'}</span>
            <div
              className={`p-2 rounded-full border transition-all duration-300 group-hover:-translate-y-0.5 border-brand-charcoal/20 bg-white text-brand-charcoal hover:shadow-xs`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  )
}
