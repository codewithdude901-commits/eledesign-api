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
    <footer className={`pt-12 pb-12 transition-colors duration-500 border-t border-black/10`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-16">
          {/* Column 1: Brand story & Socials */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 -ml-5 -mt-5">
              <img
                src={'/logo.jpeg'}
                className="w-full max-w-40 md:max-w-52 h-auto  ml-2 md:ml-0 "
              />
            </div>

            <p className={`text-sm leading-relaxed  max-w-sm`}>
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
            <p className={`text-sm leading-relaxed `}>
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
                    className={`w-full text-xs p-3.5 pr-12  border `}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="Subscribe"
                    className={`absolute right-2 p-2  cursor-pointer `}
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
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center space-x-4 pt-2">
              {/* Instagram Icon */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-3 bg-stone-200 text-stone-900 hover:bg-emerald-800 hover:text-white transition-colors duration-300"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn Icon */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-3 bg-stone-200 text-stone-900 hover:bg-emerald-800 hover:text-white transition-colors duration-300"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* YouTube Icon */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-3 bg-stone-200 text-stone-900 hover:bg-emerald-800 hover:text-white transition-colors duration-300"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
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
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer group select-none `}
          >
            <span>{locale === 'de' ? 'Zurück nach oben' : 'Back to top'}</span>
            <div
              className={`p-2 rounded-full border transition-all duration-300 group-hover:-translate-y-0.5  bg-white `}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  )
}
