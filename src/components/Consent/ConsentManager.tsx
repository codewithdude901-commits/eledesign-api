'use client'

import Script from 'next/script'
import { useParams } from 'next/navigation'

export function ConsentManager() {
  const { locale } = useParams<{ locale: 'en' | 'de' }>()

  const isGerman = locale === 'de'
  const privacyUrl = `/${locale}/privacy`

  const consentConfig = {
    text: {
      prompt: {
        description: isGerman
          ? '<p>Wir verwenden Cookies, um Ihre Nutzererfahrung zu verbessern, personalisierte Inhalte bereitzustellen und unseren Datenverkehr zu analysieren.</p>'
          : '<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.</p>',
        acceptAllButtonText: isGerman ? 'Alle akzeptieren' : 'Accept all',

        rejectNonEssentialButtonText: isGerman
          ? 'Nicht erforderliche ablehnen'
          : 'Reject non-essential',

        preferencesButtonText: isGerman ? 'Einstellungen' : 'Preferences',
      },

      preferences: {
        title: isGerman ? 'Cookie-Einstellungen anpassen' : 'Customize your cookie preferences',

        description: isGerman
          ? '<p>Wir respektieren Ihr Recht auf Privatsphäre. Sie können wählen, welche Arten von Cookies Sie zulassen möchten. Ihre Cookie-Einstellungen gelten für unsere gesamte Website.</p>'
          : '<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>',

        saveButtonText: isGerman ? 'Speichern und schließen' : 'Save and close',
      },
    },

    consentTypes: [
      {
        id: 'essential',

        label: isGerman ? 'Essenziell' : 'Essential',

        description:
          (isGerman
            ? 'Diese Cookies und Speichertechnologien sind für die Funktion der Website erforderlich, einschließlich Warenkorb, Checkout, Sicherheit und Zahlungsfunktionen.'
            : 'These cookies and storage technologies are necessary for the website to function, including shopping cart, checkout, security, and payment functionality.') +
          ` <a href="${privacyUrl}">${isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}</a>.`,

        required: true,
      },

      {
        id: 'analytics',

        label: isGerman ? 'Analyse' : 'Analytics',

        description: isGerman
          ? 'Diese Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen, damit wir sie verbessern können.'
          : 'These cookies help us understand how visitors use our website so we can improve it.',

        defaultValue: false,

        gtag: 'analytics_storage',
      },

      {
        id: 'marketing',

        label: 'Marketing',

        description: isGerman
          ? 'Diese Cookies werden verwendet, um Werbe- und Marketingaktivitäten zu messen und zu personalisieren.'
          : 'These cookies are used to measure and personalize advertising and marketing activities.',

        defaultValue: false,

        gtag: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      },
    ],
  }

  return (
    <>
      <link rel="stylesheet" href="/consent/silktide-consent-manager.css" />

      <Script src="/consent/silktide-consent-manager.js" strategy="beforeInteractive" />

      <Script id="silktide-config" strategy="afterInteractive">
        {`
          window.silktideConsentManager.init(
            ${JSON.stringify(consentConfig)}
          )
        `}
      </Script>
    </>
  )
}
