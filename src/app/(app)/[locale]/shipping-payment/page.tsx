import { Metadata } from 'next'
import React from 'react'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'de' ? 'Versand & Zahlung | EleDesign' : 'Shipping & Payment | EleDesign',
    description: locale === 'de' ? 'Akzeptierte Zahlungsmethoden und Lieferinformationen.' : 'Accepted payment methods and delivery information for EleDesign.',
  }
}

export default async function ShippingPaymentPage({ params }: Props) {
  const { locale } = await params

  if (locale === 'de') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
          Versand- und Zahlungsbedingungen
        </h1>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Akzeptierte Zahlungsmethoden</h2>
            <p className="mb-4">
              Wir bieten sichere Zahlungen über Stripe und PayPal an. Folgende Zahlungsmethoden stehen zur Verfügung:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kredit- / Debitkarten (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Apple Pay &amp; Google Pay</li>
            </ul>
            <p className="mt-4 text-xs text-stone-500">
              Alle Preise werden in Euro (&euro;) abgerechnet und enthalten die gesetzliche Mehrwertsteuer, sofern anwendbar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Liefergebiete &amp; Lieferzeiten</h2>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-xs sm:text-sm font-semibold">
                    <th className="p-3">Region</th>
                    <th className="p-3">Voraussichtliche Lieferzeit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  <tr>
                    <td className="p-3 font-medium">Deutschland</td>
                    <td className="p-3">2 &ndash; 4 Werktage</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">EU-Länder</td>
                    <td className="p-3">3 &ndash; 7 Werktage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Versandkosten</h2>
            <p>
              Die Versandkosten werden im Kassenbereich basierend auf Paketgewicht und Lieferadresse automatisch berechnet. Die genauen Kosten werden vor dem Absenden der Bestellung angezeigt.
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
        Shipping &amp; Payment Information
      </h1>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Accepted Payment Methods</h2>
          <p className="mb-4">
            We offer secure payments through Stripe and PayPal. The following payment methods are supported:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Credit / Debit Cards (Visa, Mastercard, American Express)</li>
            <li>PayPal</li>
            <li>Apple Pay &amp; Google Pay</li>
          </ul>
          <p className="mt-4 text-xs text-stone-500">
            All prices are billed in Euros (&euro;) and include statutory VAT where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Shipping Destinations &amp; Estimates</h2>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-xs sm:text-sm font-semibold">
                  <th className="p-3">Region</th>
                  <th className="p-3">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                <tr>
                  <td className="p-3 font-medium">Germany</td>
                  <td className="p-3">2 &ndash; 4 business days</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">EU Countries</td>
                  <td className="p-3">3 &ndash; 7 business days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Shipping Fees</h2>
          <p>
            Shipping costs are calculated automatically at checkout based on package weight and destination address. Exact costs are displayed before you finalize your order.
          </p>
        </section>
      </div>
    </main>
  )
}