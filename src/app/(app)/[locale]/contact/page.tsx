import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface ContactPageProps {
  params: Promise<{
    locale: string
  }>
}

type Locale = 'de' | 'en'

const translations = {
  de: {
    metaTitle: 'Kontakt | EleDesign',
    metaDescription:
      'Nehmen Sie Kontakt mit EleDesign auf. Wir freuen uns auf Ihre Fragen zu unseren Gartenpaketen und Produkten.',
    badge: 'Kontakt',
    heading: 'Lassen Sie uns zusammenarbeiten.',
    subheading:
      'Haben Sie Fragen zu unseren Gartenpaketen, Vorbestellungen oder individuellen Planungen? Schreiben Sie uns eine Nachricht.',
    formTitle: 'Nachricht senden',
    nameLabel: 'Name',
    namePlaceholder: 'Ihr vollständiger Name',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'ihre.email@beispiel.de',
    subjectLabel: 'Betreff',
    subjectPlaceholder: 'Worum geht es?',
    messageLabel: 'Nachricht',
    messagePlaceholder: 'Wie können wir Ihnen helfen?',
    submitButton: 'Nachricht absenden',
    contactDetailsTitle: 'Direkter Kontakt',
    emailTitle: 'E-Mail',
    locationTitle: 'Standort',
    locationValue: 'Deutschland',
    socialTitle: 'Folgen Sie uns',
  },
  en: {
    metaTitle: 'Contact | EleDesign',
    metaDescription:
      'Get in touch with EleDesign. We look forward to answering your questions about our garden sets and products.',
    badge: 'Contact',
    heading: 'Let’s start a conversation.',
    subheading:
      'Have questions about our garden bundles, pre-orders, or custom designs? Send us a message and we will get back to you.',
    formTitle: 'Send a Message',
    nameLabel: 'Full Name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your.email@example.com',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'How can we help?',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us more about your request...',
    submitButton: 'Send Message',
    contactDetailsTitle: 'Direct Contact',
    emailTitle: 'Email',
    locationTitle: 'Location',
    locationValue: 'Germany',
    socialTitle: 'Follow Us',
  },
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const currentLocale = (locale === 'de' ? 'de' : 'en') as Locale
  const t = translations[currentLocale] || translations.de

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `https://eledesign.de/${currentLocale}/contact`,
      languages: {
        de: 'https://eledesign.de/de/contact',
        en: 'https://eledesign.de/en/contact',
      },
    },
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params

  if (locale !== 'de' && locale !== 'en') {
    notFound()
  }

  const t = translations[locale as Locale]

  return (
    <main className="min-h-screen  text-stone-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="max-w-2xl mb-12">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl">
            {t.heading}
          </h1>
          <p className="text-stone-600 text-lg leading-relaxed">{t.subheading}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-stone-200 p-6 md:p-10 rounded-none shadow-none">
            <h2 className="text-xl text-stone-900 mb-8">{t.formTitle}</h2>

            <form action="/api/contact" method="POST" className="space-y-8">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1"
                >
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder={t.namePlaceholder}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300  text-sm focus:border-stone-400 "
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1"
                >
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300  text-sm focus:border-stone-400 "
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1"
                >
                  {t.subjectLabel}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder={t.subjectPlaceholder}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300  text-sm focus:border-stone-400 "
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1"
                >
                  {t.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  placeholder={t.messagePlaceholder}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300  text-sm focus:border-stone-400 "
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs uppercase tracking-widest rounded-none transition duration-200"
              >
                {t.submitButton}
              </button>
            </form>
          </div>

          {/* Side Details & Social Icons */}
          <aside className="lg:col-span-5 space-y-10 lg:pl-6">
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-stone-700 font-semibold">
                {t.contactDetailsTitle}
              </h3>

              <div className="border-t border-stone-200 pt-4">
                <span className="text-xs text-stone-700 uppercase block mb-1">{t.emailTitle}</span>
                <a
                  href="mailto:info@eledesign.de"
                  className="text-stone-900 hover:text-emerald-800 text-lg font-medium transition"
                >
                  info@eledesign.de
                </a>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <span className="text-xs text-stone-700 uppercase block mb-1">
                  {t.locationTitle}
                </span>
                <p className="text-stone-900 text-base font-medium">{t.locationValue}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-stone-200 pt-8">
              <h3 className="text-xs uppercase tracking-widest text-stone-700 font-semibold">
                {t.socialTitle}
              </h3>

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
          </aside>
        </div>
      </div>
    </main>
  )
}
