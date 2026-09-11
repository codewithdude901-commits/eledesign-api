import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ locale: 'de' | 'en' }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isDe = locale === 'de'
  
  return {
    title: isDe ? 'Impressum | eledesign' : 'Legal Notice (Impressum) | eledesign',
    description: isDe 
      ? 'Anbieterkennzeichnung gemäß § 5 DDG für eledesign – eine Marke der Stauden Peters Pflanzenvertriebs GmbH.'
      : 'Legal Notice pursuant to Section 5 DDG for eledesign – a brand of Stauden Peters Pflanzenvertriebs GmbH.',
    alternates: {
      canonical: `https://www.eledesign.de/${locale}/impressum`,
      languages: {
        'de': 'https://www.eledesign.de/de/impressum',
        'en': 'https://www.eledesign.de/en/impressum',
      },
    },
  }
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params

  if (locale !== 'de' && locale !== 'en') {
    notFound()
  }

  const isDe = locale === 'de'

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-neutral-800">
     

      {isDe ? (
        <article className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Impressum</h1>
          <p className="text-sm text-neutral-500 mb-8">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Stauden Peters Pflanzenvertriebs GmbH</h2>
            <p className="m-0">eledesign ist eine Marke der Stauden Peters Pflanzenvertriebs GmbH.</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Deutschland</p>
          </section>

          <section className="mb-6">
            <p className="m-0"><strong>Telefon:</strong> +49 (0)2826 9150-0</p>
            <p className="m-0"><strong>E-Mail:</strong> info@eledesign.de</p>
            <p className="m-0"><strong>Website:</strong> www.eledesign.de</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Vertreten durch</h3>
            <p className="m-0">Geschäftsführer: Klaus-Jürgen Peters</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Handelsregister</h3>
            <p className="m-0">Registergericht: Amtsgericht Kleve</p>
            <p className="m-0">Handelsregisternummer: HRB 933</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Umsatzsteuer-Identifikationsnummer</h3>
            <p className="m-0">Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE120127172</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Verantwortlich für journalistisch-redaktionelle Inhalte</h3>
            <p className="m-0">Soweit auf dieser Website journalistisch-redaktionell gestaltete Angebote im Sinne von § 18 Abs. 2 Medienstaatsvertrag (MStV) bereitgestellt werden, ist verantwortlich:</p>
            <p className="m-0">Klaus-Jürgen Peters</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Deutschland</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Verbraucherstreitbeilegung</h3>
            <p className="m-0">Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Haftung für Inhalte</h3>
            <p>Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch grundsätzlich nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder aktiv nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Sobald uns konkrete Rechtsverletzungen bekannt werden, werden wir die betreffenden Inhalte im Rahmen der gesetzlichen Vorgaben entfernen oder den Zugang zu ihnen sperren.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Haftung für Links</h3>
            <p>Unser Angebot kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist der jeweilige Anbieter oder Betreiber verantwortlich. Eine permanente Kontrolle externer Inhalte ist ohne konkrete Anhaltspunkte für eine Rechtsverletzung nicht zumutbar. Werden uns Rechtsverletzungen bekannt, entfernen wir entsprechende Links im Rahmen der gesetzlichen Vorgaben.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Urheberrecht</h3>
            <p>Die auf dieser Website veröffentlichten Inhalte und Werke unterliegen dem deutschen Urheberrecht und gegebenenfalls weiteren Schutzrechten. Jede Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung außerhalb der gesetzlich zulässigen Grenzen bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers. Soweit Inhalte nicht von uns erstellt wurden, werden Rechte Dritter beachtet. Hinweise auf mögliche Rechtsverletzungen können an info@eledesign.de gerichtet werden.</p>
          </section>
        </article>
      ) : (
        <article className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Legal Notice (Impressum)</h1>
          <p className="text-sm text-neutral-500 mb-8">Information pursuant to Section 5 of the German Digital Services Act (Digitale-Dienste-Gesetz – DDG)</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Stauden Peters Pflanzenvertriebs GmbH</h2>
            <p className="m-0">eledesign is a brand of Stauden Peters Pflanzenvertriebs GmbH.</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Germany</p>
          </section>

          <section className="mb-6">
            <p className="m-0"><strong>Phone:</strong> +49 (0)2826 9150-0</p>
            <p className="m-0"><strong>Email:</strong> info@eledesign.de</p>
            <p className="m-0"><strong>Website:</strong> www.eledesign.de</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Represented by</h3>
            <p className="m-0">Managing Director: Klaus-Jürgen Peters</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Commercial Register</h3>
            <p className="m-0">Register Court: Local Court (Amtsgericht) Kleve</p>
            <p className="m-0">Commercial Register No.: HRB 933</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">VAT Identification Number</h3>
            <p className="m-0">VAT identification number pursuant to Section 27a of the German Value Added Tax Act: DE120127172</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Responsible for journalistic-editorial content</h3>
            <p className="m-0">To the extent that this website provides journalistic-editorial content within the meaning of Section 18(2) of the German State Media Treaty (Medienstaatsvertrag – MStV), the person responsible is:</p>
            <p className="m-0">Klaus-Jürgen Peters</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Germany</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Consumer dispute resolution</h3>
            <p className="m-0">We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Liability for content</h3>
            <p>As a digital service provider, we are responsible for our own content on these pages in accordance with applicable law. As a rule, however, we are not required to monitor transmitted or stored third-party information or actively investigate circumstances indicating unlawful activity. Statutory obligations to remove information or block access remain unaffected. Once we become aware of a specific infringement, we will remove or block the relevant content as required by law.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Liability for links</h3>
            <p>Our website may contain links to external third-party websites over whose content we have no control. The respective provider or operator is responsible for the content of linked pages. Permanent monitoring of external content is not reasonable without specific indications of an infringement. If we become aware of unlawful content, we will remove the relevant links as required by law.</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Copyright</h3>
            <p>The content and works published on this website are protected by German copyright law and, where applicable, other intellectual-property rights. Any reproduction, editing, distribution or other exploitation beyond statutory exceptions requires the prior consent of the relevant rights holder. Where content was not created by us, third-party rights are respected. Notices of possible infringement may be sent to info@eledesign.de.</p>
          </section>
        </article>
      )}
    </main>
  )
}