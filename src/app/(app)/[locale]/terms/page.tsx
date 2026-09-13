import { Metadata } from 'next'
import React from 'react'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'de' ? 'AGB | EleDesign' : 'Terms & Conditions | EleDesign',
    description: locale === 'de' ? 'Allgemeine Geschäftsbedingungen für den EleDesign Online-Shop.' : 'General Terms and Conditions for EleDesign online store.',
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params

  if (locale === 'de') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">1. Geltungsbereich &amp; Anbieter</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen und Verträge, die über die Website eledesign.de zwischen EleDesign („wir“ oder „Anbieter“) und dem Kunden („Kunde“) geschlossen werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">2. Vertragsschluss</h2>
            <p className="mb-2">
              1. Die Präsentation der Produkte auf unserer Website stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.
            </p>
            <p className="mb-2">
              2. Durch Anklicken des Buttons <strong>„Kostenpflichtig bestellen“</strong> oder <strong>„Jetzt kaufen“</strong> gibt der Kunde ein verbindliches Angebot zum Kauf der im Warenkorb enthaltenen Waren ab.
            </p>
            <p>
              3. Der Vertrag kommt zustande, wenn wir Ihr Angebot durch eine Auftragsbestätigung per E-Mail oder durch Versendung der Ware annehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">3. Preise und Zahlung</h2>
            <p className="mb-2">
              1. Alle angegebenen Preise enthalten die gesetzliche Mehrwertsteuer (MwSt.), sofern anwendbar, zuzüglich Versandkosten.
            </p>
            <p className="mb-2">
              2. Die Zahlung erfolgt über die im Bestellvorgang angebotenen Zahlungsarten (u. a. Kreditkarte, Apple Pay, Google Pay oder PayPal via Stripe).
            </p>
            <p>
              3. Der Kunde hat für eine ausreichende Deckung des gewählten Zahlungsmittels zu sorgen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">4. Lieferung &amp; Versand</h2>
            <p className="mb-2">
              1. Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse.
            </p>
            <p>
              2. Voraussichtliche Lieferzeiten und Versandkosten sind auf der Seite Versand &amp; Zahlung aufgeführt und werden vor Abschluss der Bestellung angezeigt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">5. Gewährleistung &amp; Haftung</h2>
            <p className="mb-2">
              1. Es gelten die gesetzlichen Gewährleistungsrechte des deutschen und europäischen Kaufrechts.
            </p>
            <p>
              2. Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">6. Anwendbares Recht</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes bleiben unberührt.
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
        Terms &amp; Conditions (AGB)
      </h1>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">1. Scope &amp; Provider</h2>
          <p>
            These Terms &amp; Conditions govern all sales and contracts concluded through the website eledesign.de between EleDesign (&quot;we&quot; or &quot;Vendor&quot;) and the customer (&quot;Customer&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">2. Conclusion of Contract</h2>
          <p className="mb-2">
            1. Product presentations on our website do not constitute a legally binding offer, but an invitation to place an order.
          </p>
          <p className="mb-2">
            2. By clicking the button <strong>&quot;Kostenpflichtig bestellen&quot;</strong> (Order with obligation to pay) or <strong>&quot;Jetzt kaufen&quot;</strong> (Buy now), the Customer submits a binding offer to purchase the items in the shopping cart.
          </p>
          <p>
            3. The contract is concluded when we accept your offer by sending an automated order confirmation via email or by dispatching the goods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">3. Prices and Payment</h2>
          <p className="mb-2">
            1. All prices listed on the website include statutory Value Added Tax (VAT / MwSt.), where applicable, plus shipping costs.
          </p>
          <p className="mb-2">
            2. Payment can be made using the payment methods indicated during the checkout process (including Credit/Debit Cards, Apple Pay, Google Pay, or PayPal via Stripe).
          </p>
          <p>
            3. The Customer is responsible for ensuring sufficient funds or authorization for the chosen payment method.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">4. Delivery &amp; Shipping</h2>
          <p className="mb-2">
            1. Delivery is made to the shipping address specified by the Customer during checkout.
          </p>
          <p>
            2. Estimated delivery times and shipping fees are detailed on our Shipping &amp; Payment page and displayed prior to order confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">5. Warranty &amp; Liability</h2>
          <p className="mb-2">
            1. Statutory warranty rights (<em>Gewährleistungsrechte</em>) under EU and German law apply to all physical goods.
          </p>
          <p>
            2. We are liable without limitation for intent and gross negligence. For light negligence, our liability is limited to foreseeable, contract-typical damages resulting from a breach of an essential contractual obligation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">6. Applicable Law</h2>
          <p>
            The laws of the Federal Republic of Germany apply, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). Mandatory consumer protection regulations of your country of residence remain unaffected.
          </p>
        </section>
      </div>
    </main>
  )
}