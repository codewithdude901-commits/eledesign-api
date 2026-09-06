import { FAQAccordion, GuideTabs } from '@/components/guide-interactive'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PlantGuidePageProps {
  params: Promise<{
    locale: string
  }>
}

type Locale = 'de' | 'en'

const translations = {
  de: {
    metaTitle: 'Pflanzanleitung, Versand & Pflege | EleDesign',
    metaDescription:
      'Erfahren Sie alles über unseren sicheren Pflanzenversand, die nachhaltige Verpackung und nutzen Sie unseren maßgeschneiderten PDF-Pflanzplan für Ihren Garten.',
    badge: 'Service & Dokumentation',
    heading: 'Vom Paket bis zum blühenden Garten.',
    subheading:
      'Transparenter Versand, nachhaltige Schutzverpackungen und präzise digitale Pflanzpläne – damit Ihre Gartengestaltung auf Anhieb gelingt.',

    stat1Number: '100%',
    stat1Label: 'Plastikfreier Schutzversand',
    stat2Number: '48-72h',
    stat2Label: 'Optimierte Transportzeit',
    stat3Number: 'PDF Plan',
    stat3Label: 'Im Lieferumfang enthalten',

    shippingHeading: 'Logistik & Schutzsystem',
    shippingSub: 'Wie wir Ihre Pflanzen sicher liefern',
    box1Title: 'Spezial-Kartonnagen',
    box1Desc:
      'Passgenaue Fixierungen verhindern ein Verrutschen oder Umkippen der Töpfe während des Transports.',
    box2Title: 'Wurzel-Feuchteschutz',
    box2Desc: 'Biologisch abbaubares Vlies hält das Substrat während der Reise optimal feucht.',
    box3Title: 'Klimaneutraler Versand',
    box3Desc:
      'Wir versenden mit ausgewählten Partnern, um den ökologischen Fußabdruck so gering wie möglich zu halten.',

    stepsTitle: 'Ihr PDF-Pflanzguide in der Praxis',
    stepsSub: 'Schritt-für-Schritt Anleitung zur Nutzung Ihres mitgelieferten Layouts',
    steps: [
      {
        id: 'prep',
        title: 'Vorbereitung',
        subtitle: 'Boden & Werkzeug',
        description:
          'Laden Sie Ihren individuellen PDF-Pflanzplan über den Link in Ihrer Versandbestätigung herunter. Lockern Sie den Gartenboden tiefgründig auf und mischen Sie bei Bedarf organischen Kompost ein.',
        checklist: [
          'PDF-Plan auf Smartphone oder Tablet öffnen',
          'Erde ca. 30 cm tief lockern',
          'Unkraut und große Steine entfernen',
        ],
        tip: 'Stellen Sie die Pflanzen vor dem Einsetzen für 10 Minuten in ein Wasserbad, bis keine Luftblasen mehr aufsteigen.',
      },
      {
        id: 'layout',
        title: 'Ausstellung',
        subtitle: 'Raster & Abstände',
        description:
          'Stellen Sie die Töpfe gemäß dem Raster in Ihrer PDF-Anleitung aus. Achten Sie auf die angegebenen Abstände, damit jede Pflanze ausreichend Licht und Entfaltungsraum erhält.',
        checklist: [
          'Rastermaße aus dem PDF im Beet markieren',
          'Höhere Pflanzen im Hintergrund platzieren',
          'Sichtprüfung der Abstände durchführen',
        ],
        tip: 'Nutzen Sie ein Holzmaßband, um die im PDF vorgegebenen Zentimeterabstände exakt einzuhalten.',
      },
      {
        id: 'planting',
        title: 'Einpflanzen',
        subtitle: 'Einsetzen & Andrücken',
        description:
          'Heben Sie Pflanzlöcher aus, die doppelt so breit wie der Topfballen sind. Setzen Sie die Pflanzen so tief ein, wie sie im Topf standen, und drücken Sie die Erde leicht an.',
        checklist: [
          'Pflanzloch doppelt so breit wie der Ballen ausheben',
          'Wurzelballen leicht lockern',
          'Oberkante des Ballens bündig mit dem Boden ausrichten',
        ],
        tip: 'Vermeiden Sie es, das Substrat zu fest anzutreten, um Verdichtungen der Erde zu verhindern.',
      },
      {
        id: 'care',
        title: 'Anwässern',
        subtitle: 'Feuchtigkeit & Pflege',
        description:
          'Gießen Sie die Beete gründlich an. Eine Schicht Rindenmulch oder Kompost schützt den Boden vor dem Austrocknen und hält Unkraut fern.',
        checklist: [
          'Ausgiebiges Anwässern direkt an der Basis',
          'Optional: 3-5 cm Mulchschicht auftragen',
          'In den ersten 2 Wochen regelmäßig feucht halten',
        ],
        tip: 'Morgendliches Gießen verhindert Verdunstungsverluste und schützt vor Pilzerkrankungen.',
      },
    ],

    pdfFeatureTitle: 'Das beinhaltet Ihr digitaler PDF-Guide',
    pdfFeatures: [
      {
        title: 'Maßstabsgetreuer Pflanzplan',
        desc: 'Eine klare Visualisierung, wo jede Sorte für das beste visuelle Ergebnis platziert wird.',
      },
      {
        title: 'Saisonale Pflegekarte',
        desc: 'Monatsgenaue Hinweise zu Rückschnitt, Düngung und Überwinterung.',
      },
      {
        title: 'Einkaufs- & Vorbereitungsliste',
        desc: 'Überblick über benötigte Erde, Düngermenge und Empfehlungen für Werkzeuge.',
      },
    ],

    faqTitle: 'Häufig gestellte Fragen',
    faqs: [
      {
        category: 'Versand & Lieferung',
        question: 'Wie lange dauert die Zustellung meiner Pflanzen?',
        answer:
          'In der Regel erfolgt die Zustellung innerhalb von 2 bis 4 Werktagen. Wir versenden bevorzugt von Montag bis Mittwoch, um Wochenendlagerungen im Depot zu vermeiden.',
      },
      {
        category: 'Digitaler Guide',
        question: 'Wo finde ich den PDF-Pflanzplan für meine Bestellung?',
        answer:
          'Sobald Ihr Paket versendet wird, erhalten Sie eine E-Mail mit dem direkten Download-Link zu Ihrem maßgeschneiderten PDF-Guide.',
      },
      {
        category: 'Pflanzung & Garantie',
        question: 'Was passiert, wenn eine Pflanze Transportschäden aufweist?',
        answer:
          'Sollte eine Pflanze beschädigt ankommen, senden Sie uns einfach innerhalb von 48 Stunden nach Anlieferung ein Foto über unser Kontaktformular. Wir ersetzen diese umgehend.',
      },
      {
        category: 'Pflege',
        question: 'Kann ich die Pflanzen auch in Kübel statt ins Beet pflanzen?',
        answer:
          'Ja, viele unserer Pakete eignen sich auch für große Pflanzkübel. Hinweise zu den benötigten Kübelgrößen finden Sie ebenfalls im PDF-Guide.',
      },
    ],

    ctaHeading: 'Sie benötigen Hilfe bei Ihrem Projekt?',
    ctaSubheading:
      'Unser Team berät Sie gerne zu Standortfragen, Bodenverhältnissen oder Lieferzeiten.',
    ctaButton: 'Zum Kontaktformular',
  },
  en: {
    metaTitle: 'Planting Guide, Shipping & Care | EleDesign',
    metaDescription:
      'Discover our eco-friendly packaging, fast delivery process, and learn how to use your personalized PDF planting guide for your garden.',
    badge: 'Service & Documentation',
    heading: 'From delivery box to a thriving garden.',
    subheading:
      'Transparent shipping, sustainable protection packaging, and precise digital planting guides ensuring your landscape project succeeds.',

    stat1Number: '100%',
    stat1Label: 'Plastic-Free Protective Packaging',
    stat2Number: '48-72h',
    stat2Label: 'Optimized Transit Time',
    stat3Number: 'PDF Guide',
    stat3Label: 'Included With Every Order',

    shippingHeading: 'Logistics & Packaging Systems',
    shippingSub: 'How we safely ship living plants to your doorstep',
    box1Title: 'Custom Fit Cartons',
    box1Desc:
      'Engineered inner clamps keep pots rigid, preventing tilting or soil displacement during transport.',
    box2Title: 'Root Hydration Layer',
    box2Desc:
      'Biodegradable moisture wraps preserve root dampness throughout the delivery transit.',
    box3Title: 'Climate Conscious Transit',
    box3Desc:
      'We partner with logistics networks focused on minimizing carbon footprints across Europe.',

    stepsTitle: 'Putting Your PDF Guide Into Action',
    stepsSub: 'Step-by-step workflow for implementing your digital garden layout',
    steps: [
      {
        id: 'prep',
        title: 'Preparation',
        subtitle: 'Soil & Tools',
        description:
          'Download your custom PDF plan via the link in your dispatch email. Loosen the garden bed soil deeply and incorporate organic compost if needed.',
        checklist: [
          'Open PDF plan on mobile or tablet',
          'Loosen soil down to 30 cm depth',
          'Remove weeds, roots, and rocks',
        ],
        tip: 'Submerge plant roots in water for 10 minutes prior to planting until air bubbles stop rising.',
      },
      {
        id: 'layout',
        title: 'Layout Grid',
        subtitle: 'Positioning & Spacing',
        description:
          'Arrange pots according to the spacing grid shown in your PDF guide. Proper distance ensures plants receive sufficient light and air circulation.',
        checklist: [
          'Mark grid dimensions on soil',
          'Position taller species toward the rear',
          'Verify overall arrangement',
        ],
        tip: 'Use a tape measure to match the exact centimeter guidelines provided in the PDF layout.',
      },
      {
        id: 'planting',
        title: 'Planting',
        subtitle: 'Insertion & Soil',
        description:
          'Dig holes twice as wide as the root ball. Set plants at the exact same depth they were in their nursery pots and press soil gently around roots.',
        checklist: [
          'Dig hole twice as wide as root ball',
          'Gently loosen bound roots',
          'Align top of soil level with ground',
        ],
        tip: 'Avoid overly compacting soil with heavy force to maintain vital aeration for roots.',
      },
      {
        id: 'care',
        title: 'Watering',
        subtitle: 'Hydration & Mulch',
        description:
          'Water thoroughly immediately after planting. Apply a mulch layer to conserve moisture and suppress unwanted weed growth.',
        checklist: [
          'Thorough initial watering at base',
          'Apply 3-5 cm mulch layer',
          'Maintain consistent soil moisture for 2 weeks',
        ],
        tip: 'Watering early in the morning reduces evaporation losses and prevents leaf moisture diseases.',
      },
    ],

    pdfFeatureTitle: 'What is Included in Your PDF Guide',
    pdfFeatures: [
      {
        title: 'To-Scale Layout Diagram',
        desc: 'A precise visual map showing where every single variety belongs for optimal aesthetic contrast.',
      },
      {
        title: 'Seasonal Care Schedule',
        desc: 'Month-by-month instructions for pruning, fertilizing, and winter preparation.',
      },
      {
        title: 'Preparation & Tool Checklist',
        desc: 'Detailed breakdown of necessary soil amendments, fertilizer volumes, and recommended tools.',
      },
    ],

    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        category: 'Shipping & Delivery',
        question: 'How long does plant delivery take?',
        answer:
          'Deliveries typically take between 2 to 4 business days. We dispatch orders Monday through Wednesday to avoid weekend warehouse stays.',
      },
      {
        category: 'Digital Guide',
        question: 'Where can I access my PDF planting guide?',
        answer:
          'Once your parcel is dispatched, you will receive an email containing a direct download link to your tailored PDF guide.',
      },
      {
        category: 'Guarantee',
        question: 'What if a plant arrives damaged?',
        answer:
          'If a plant arrives damaged, send us a photo via our contact form within 48 hours of receipt. We will arrange a replacement immediately.',
      },
      {
        category: 'Planting',
        question: 'Can I plant these in containers instead of garden beds?',
        answer:
          'Yes, many of our bundle arrangements work beautifully in large planters. Container sizing details are specified inside the PDF guide.',
      },
    ],

    ctaHeading: 'Need assistance with your garden layout?',
    ctaSubheading:
      'Our team is available to assist with site conditions, delivery queries, or plant choices.',
    ctaButton: 'Go to Contact Form',
  },
}

export async function generateMetadata({ params }: PlantGuidePageProps): Promise<Metadata> {
  const { locale } = await params
  const currentLocale = (locale === 'de' ? 'de' : 'en') as Locale
  const t = translations[currentLocale] || translations.de

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `https://eledesign.de/${currentLocale}/plant-guide`,
      languages: {
        de: 'https://eledesign.de/de/plant-guide',
        en: 'https://eledesign.de/en/plant-guide',
      },
    },
  }
}

export default async function PlantGuidePage({ params }: PlantGuidePageProps) {
  const { locale } = await params

  if (locale !== 'de' && locale !== 'en') {
    notFound()
  }

  const currentLocale = locale as Locale
  const t = translations[currentLocale]

  return (
    <main className="min-h-screen text-stone-900 py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
        {/* Header Hero Section */}
        <header className="max-w-3xl border-b border-stone-200 pb-8 md:pb-10">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold mb-2 block">
            {t.badge}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-4">
            {t.heading}
          </h1>
          <p className="text-stone-800 text-base md:text-lg leading-relaxed">{t.subheading}</p>
        </header>

        {/* Highlights Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-200/50 p-6 md:p-10 rounded-none">
          <div className="border-b md:border-b-0 md:border-r border-stone-400 pb-4 md:pb-0 md:pr-6">
            <span className="text-2xl md:text-3xl font-bold  block mb-1">
              {t.stat1Number}
            </span>
            <span className="text-xs uppercase tracking-wider text-stone-800 font-medium">
              {t.stat1Label}
            </span>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-stone-800 pb-4 md:pb-0 md:pr-6">
            <span className="text-2xl md:text-3xl font-bold  block mb-1">
              {t.stat2Number}
            </span>
            <span className="text-xs uppercase tracking-wider text-stone-800 font-medium">
              {t.stat2Label}
            </span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-bold  block mb-1">
              {t.stat3Number}
            </span>
            <span className="text-xs uppercase tracking-wider text-stone-800 font-medium">
              {t.stat3Label}
            </span>
          </div>
        </section>

        {/* Shipping & Protection Section */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold block mb-1">
              Logistics
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{t.shippingHeading}</h2>
            <p className="text-stone-800">{t.shippingSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200 p-6 rounded-none space-y-2">
              <span className="text-xs font-mono text-stone-800 block">01 / PACKAGING</span>
              <h3 className="text-base font-bold text-stone-900">{t.box1Title}</h3>
              <p className=" text-stone-800 leading-relaxed">{t.box1Desc}</p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-none space-y-2">
              <span className="text-xs font-mono text-stone-800 block">02 / HYDRATION</span>
              <h3 className="text-base font-bold text-stone-900">{t.box2Title}</h3>
              <p className=" text-stone-800 leading-relaxed">{t.box2Desc}</p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-none space-y-2">
              <span className="text-xs font-mono text-stone-800 block">03 / TRANSPORT</span>
              <h3 className="text-base font-bold text-stone-900">{t.box3Title}</h3>
              <p className=" text-stone-800 leading-relaxed">{t.box3Desc}</p>
            </div>
          </div>
        </section>

        {/* Step-by-Step Interactive Guide */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold block mb-1">
              Implementation
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{t.stepsTitle}</h2>
            <p className="text-stone-800">{t.stepsSub}</p>
          </div>

          <GuideTabs steps={t.steps} />
        </section>

        {/* PDF Feature Breakdown */}
        <section className="bg-stone-200/50 border border-stone-300 p-6 md:p-10 rounded-none space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold block mb-1">
              Digital Assets
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-stone-900">{t.pdfFeatureTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.pdfFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 border border-stone-300 rounded-none space-y-2"
              >
                <span className="text-sm font-mono text-emerald-800 font-bold block">
                  FEATURE 0{idx + 1}
                </span>
                <h3 className=" font-bold text-stone-900">{feature.title}</h3>
                <p className=" text-stone-800 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold block mb-1">
              Help Center
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{t.faqTitle}</h2>
          </div>

          <FAQAccordion faqs={t.faqs} />
        </section>

        {/* Contact CTA Section */}
        <section className="bg-stone-800 text-white p-8 md:p-12 rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
              Support & Inquiries
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t.ctaHeading}</h2>
            <p className="text-stone-300 leading-relaxed">{t.ctaSubheading}</p>
          </div>

          <Link
            href={`/${currentLocale}/contact`}
            className="inline-block px-6 py-3.5 bg-white text-stone-900 hover:bg-white/90  text-xs uppercase tracking-widest font-bold transition-colors rounded-none whitespace-nowrap"
          >
            {t.ctaButton}
          </Link>
        </section>
      </div>
    </main>
  )
}
