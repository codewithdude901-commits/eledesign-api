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
    title: isDe ? 'Datenschutzerklärung | eledesign' : 'Privacy Policy | eledesign',
    description: isDe
      ? 'Datenschutzerklärung gemäß DSGVO für eledesign – eine Marke der Stauden Peters Pflanzenvertriebs GmbH.'
      : 'GDPR Privacy Policy for eledesign – a brand of Stauden Peters Pflanzenvertriebs GmbH.',
    alternates: {
      canonical: `https://www.eledesign.de/${locale}/privacy`,
      languages: {
        de: 'https://www.eledesign.de/de/privacy',
        en: 'https://www.eledesign.de/en/privacy',
      },
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params

  if (locale !== 'de' && locale !== 'en') {
    notFound()
  }

  const isDe = locale === 'de'

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-neutral-800">
      {isDe ? (
        <article className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Datenschutzerklärung</h1>
          <p className="text-sm text-neutral-500 mb-8">Stand: 10. September 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und der sonstigen
              anwendbaren Datenschutzvorschriften ist:
            </p>
            <p className="m-0 font-medium">Stauden Peters Pflanzenvertriebs GmbH</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Deutschland</p>
            <p className="m-0">Telefon: +49 (0)2826 9150-0</p>
            <p className="m-0">E-Mail: info@eledesign.de</p>
            <p className="m-0">Website: www.eledesign.de</p>
            <p className="mt-2 text-sm text-neutral-600">
              eledesign ist eine Marke der Stauden Peters Pflanzenvertriebs GmbH.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              2. Allgemeine Hinweise zur Datenverarbeitung
            </h2>
            <p>
              Wir verarbeiten personenbezogene Daten nur, soweit dies für den Betrieb unserer
              Website, die Bereitstellung unserer Leistungen, die Bearbeitung von Bestellungen und
              Anfragen, die Durchführung von Verträgen, die Zahlungsabwicklung, den Versand, die
              Kommunikation sowie – soweit Sie eingewilligt haben – für Analyse- und Marketingzwecke
              erforderlich ist.
            </p>
            <p>
              Je nach Verarbeitung kommen insbesondere folgende Rechtsgrundlagen in Betracht: Art. 6
              Abs. 1 lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit. b DSGVO (Vertrag oder
              vorvertragliche Maßnahmen), Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung) und
              Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen). Soweit Informationen in Ihrem
              Endgerät gespeichert oder ausgelesen werden, richtet sich die Zulässigkeit zusätzlich
              nach § 25 TDDDG.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              3. Hosting, Content Delivery und technische Infrastruktur
            </h2>
            <p>
              Für den technischen Betrieb von eledesign setzen wir nach den uns vorliegenden Angaben
              Vercel, IONOS und Cloudflare ein. Bei Aufruf der Website können technisch
              erforderliche Informationen verarbeitet werden, insbesondere IP-Adresse, Datum und
              Uhrzeit des Zugriffs, aufgerufene URL bzw. Datei, Referrer-URL, Browser- und
              Geräteinformationen, Betriebssystem sowie technische Status- und Protokolldaten. Die
              Verarbeitung dient insbesondere der Auslieferung der Website, Stabilität, Sicherheit,
              Fehleranalyse und Abwehr missbräuchlicher Zugriffe.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im
              sicheren, stabilen und effizienten Betrieb unseres Online-Angebots. Soweit die
              Verarbeitung zur Durchführung eines von Ihnen angeforderten Vertrages oder
              vorvertraglicher Maßnahmen erforderlich ist, erfolgt sie zusätzlich auf Art. 6 Abs. 1
              lit. b DSGVO.
            </p>
            <p>
              Vercel und Cloudflare sind international tätige Anbieter. Dabei kann es zu
              Übermittlungen personenbezogener Daten in Drittländer, insbesondere in die USA,
              kommen. Nach den öffentlich verfügbaren Angaben stützen Vercel und Cloudflare
              einschlägige Übermittlungen unter anderem auf das EU–U.S. Data Privacy Framework
              und/oder Standardvertragsklauseln, soweit erforderlich. Für IONOS ist nach den
              vorliegenden Angaben eine Auftragsverarbeitung nach Art. 28 DSGVO vorgesehen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              4. Cookies, Local Storage und Consent-Management
            </h2>
            <p>
              Wir verwenden den Silktide Consent Manager, um Ihre Auswahl zu nicht erforderlichen
              Technologien zu verwalten. Nach der Dokumentation des Anbieters speichert der Consent
              Manager die getroffene Auswahl im Local Storage des Browsers. Dadurch kann Ihre
              Auswahl bei späteren Besuchen wiederhergestellt und geändert werden.
            </p>
            <p>
              Technisch unbedingt erforderliche Speicherungen oder Zugriffe können auf § 25 Abs. 2
              TDDDG gestützt werden. Nicht unbedingt erforderliche Technologien – insbesondere
              Analyse- oder Marketingtechnologien – werden nur nach Ihrer Einwilligung gemäß § 25
              Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO aktiviert. Sie können Ihre Einwilligung
              jederzeit mit Wirkung für die Zukunft über die auf der Website bereitgestellten
              Datenschutzeinstellungen widerrufen oder ändern.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">5. Google Analytics</h2>
            <p>
              Soweit Sie über den Consent Manager eingewilligt haben, verwenden wir Google Analytics
              zur Reichweitenmessung und Analyse der Nutzung unserer Website. Anbieter für
              europäische Nutzer ist grundsätzlich Google Ireland Limited, Gordon House, Barrow
              Street, Dublin 4, Irland; im Rahmen der Leistungserbringung können weitere
              Google-Unternehmen eingebunden sein.
            </p>
            <p>
              Dabei können insbesondere Informationen über Seitenaufrufe, Interaktionen, ungefähren
              Standort, Browser, Gerät, Betriebssystem, Referrer, Sitzungs- und Ereignisdaten
              verarbeitet werden. Nach Angaben von Google werden einzelne IP-Adressen von Nutzern in
              der EU, der Schweiz und dem Vereinigten Königreich nicht protokolliert oder
              gespeichert; sie werden vor der Protokollierung verworfen. Daten können dennoch im
              Rahmen der Google-Infrastruktur international verarbeitet werden.
            </p>
            <p>Speicherdauer:</p>
            <p>
              Daten auf Ereignisebene (z. B. Seitenaufrufe und Interaktionsereignisse) werden für
              einen Zeitraum von 2 Monaten gespeichert und danach automatisch gelöscht. Daten auf
              Nutzerebene werden für 14 Monate aufbewahrt, wobei sich die Speicherfrist bei neuer
              Aktivität vor deren Ablauf automatisch verlängert.
            </p>

            <p>Werbefunktionen & Google Signals:</p>
            <p>
              Google Signals sowie Personalisierungs- und Werbefunktionen sind deaktiviert. Wir
              nutzen Google Analytics nicht für Re-Marketing oder geräteübergreifendes
              Werbeprofiling.
            </p>

            <p>
              Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO sowie – für das
              Speichern/Auslesen nicht erforderlicher Informationen auf Ihrem Endgerät – § 25 Abs. 1
              TDDDG. Sie können die Einwilligung jederzeit über die Datenschutzeinstellungen
              widerrufen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              6. KI-gestützte Gartengestaltung mit Neighborbrite
            </h2>
            <p>
              eledesign bietet in Zusammenarbeit mit Neighborbrite Inc. eine KI-gestützte Funktion
              zur Garten- und Landschaftsgestaltung an. Sie können ein Foto Ihres Gartens, Ihrer
              Terrasse oder eines anderen Außenbereichs hochladen und Designvorgaben eingeben.
              Neighborbrite verarbeitet diese Eingaben, um automatisiert Gestaltungsvorschläge und
              Visualisierungen zu erstellen. Unabhängig davon können fertige Gartenkonzepte und
              Produkte auch direkt über www.eledesign.de ausgewählt und gekauft werden.
            </p>
            <p>
              Nach den von Ihnen bereitgestellten Informationen nutzt Neighborbrite ein proprietäres
              KI-Orchestrierungssystem mit einem sich weiterentwickelnden Ensemble verschiedener
              Modelle. Dabei können unterschiedliche Modelle den Außenbereich analysieren,
              Gestaltungsprinzipien anwenden, Pflanzen auswählen, die Komposition entwickeln und die
              Visualisierung erzeugen. Die konkret eingesetzten Modelle bzw. Drittanbieter können
              sich ändern.
            </p>
            <p>
              Dabei können insbesondere das hochgeladene Bild, Ihre Designvorgaben und Prompts,
              generierte Ergebnisse, technische Nutzungs- und Sitzungsdaten sowie eine pseudonyme
              Sitzungskennung verarbeitet werden. Für die in eledesign eingebettete
              Neighborbrite-Nutzung ist nach den vorliegenden Informationen kein separates
              Neighborbrite-Konto erforderlich.
            </p>
            <p>
              Zweck der Verarbeitung ist die Bereitstellung der von Ihnen angeforderten
              KI-Gestaltungsfunktion sowie – wenn Sie sich anschließend für einen Kauf entscheiden –
              die technische Übergabe an eledesign zur Fortsetzung des Bestellvorgangs.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung zur
              Bereitstellung der angeforderten Leistung oder zur Durchführung vorvertraglicher
              Maßnahmen erforderlich ist. Soweit für einzelne optionale Technologien eine
              Einwilligung erforderlich ist, erfolgt die Verarbeitung auf Art. 6 Abs. 1 lit. a DSGVO
              in Verbindung mit § 25 Abs. 1 TDDDG.
            </p>
            <p>
              Nach den uns bereitgestellten Angaben können Bilder außerhalb der EU/des EWR,
              einschließlich in den USA, verarbeitet oder gespeichert werden. Neighborbrite weist in
              seiner aktuellen öffentlichen Datenschutzerklärung ebenfalls darauf hin, dass seine
              Sites in den USA gehostet werden und personenbezogene Daten in die USA übertragen
              werden können.
            </p>
            <p>
              Nach den von Ihnen bereitgestellten Informationen werden hochgeladene Bilder so lange
              gespeichert, wie dies nach Einschätzung von Neighborbrite vernünftigerweise
              erforderlich ist, um den Dienst bereitzustellen, aufrechtzuerhalten, zu bewerten und
              zu verbessern; derzeit besteht danach keine feste automatische Löschfrist.
              Löschanfragen können an privacy@neighborbrite.com gerichtet werden.
            </p>
            <p>
              Ebenfalls nach den von Ihnen bereitgestellten Informationen können Kundenbilder von
              Neighborbrite zur Bewertung, Verbesserung und zum Training der eigenen Systeme und
              Dienste verwendet werden. Bei externen Modellen bzw. Dienstleistern bevorzugt
              Neighborbrite nach diesen Angaben Anbieter, die übermittelte Kundendaten nicht zum
              Training eigener Modelle verwenden; die konkreten Anbieter und Bedingungen können sich
              jedoch ändern. Wenn Sie Neighborbrite über dessen eigene App oder Website nutzen, gilt
              für die dortige Verarbeitung zusätzlich die Datenschutzerklärung von Neighborbrite.
            </p>
            <p className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-sm">
              Bitte laden Sie nach Möglichkeit nur Bilder hoch, die keine erkennbaren Personen,
              Kfz-Kennzeichen, Hausnummern oder sonstige unnötige personenbezogene Informationen
              enthalten. Wenn Bilder andere Personen zeigen, stellen Sie bitte sicher, dass Sie zur
              Übermittlung berechtigt sind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              7. Kundenkonto, Gastbestellung und Bestellabwicklung
            </h2>
            <p>
              Sie können fertige Gartenkonzepte und Produkte unmittelbar über eledesign kaufen.
              Alternativ können Sie zunächst über die auf eledesign eingebettete
              Neighborbrite-Funktion oder über eine Neighborbrite-App Ihren Garten gestalten. Wenn
              Sie nach Abschluss des Designs den Kauf fortsetzen möchten, stellt Neighborbrite einen
              Kauf-Link bzw. eine Kauf-URL zu eledesign bereit oder leitet Sie darüber zu eledesign
              weiter. Die eigentliche Bestellung, Auswahl bzw. Bestätigung der zu kaufenden
              Produkte, Eingabe der Rechnungs- und Lieferdaten, Zahlung und Bestellbestätigung
              erfolgen anschließend über eledesign. Vertragspartner für den Kauf und die
              Auftragsabwicklung ist Stauden Peters Pflanzenvertriebs GmbH als Betreiberin der Marke
              eledesign. Stauden Peters Pflanzenvertriebs GmbH erfüllt den Auftrag und veranlasst
              die Lieferung. Im Rahmen von Registrierung, Bestellung und Vertragsabwicklung
              verarbeiten wir insbesondere Name, Rechnungs- und Lieferanschrift, E-Mail-Adresse,
              Telefonnummer (soweit angegeben oder für die Zustellung erforderlich), Bestell- und
              Produktdaten, Zahlungsstatus, Kommunikationsdaten sowie gegebenenfalls Kontodaten und
              Zugangsdaten.
            </p>
            <p>
              Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen und zur Erfüllung
              des Kaufvertrags auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Soweit gesetzliche
              Aufbewahrungs- und Nachweispflichten bestehen, erfolgt die weitere Speicherung auf
              Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Buchungsbelege sind nach den derzeit
              geltenden handels- und steuerrechtlichen Vorschriften grundsätzlich acht Jahre,
              bestimmte andere Geschäftsunterlagen sechs bzw. zehn Jahre aufzubewahren.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">8. Zahlungsabwicklung mit Stripe</h2>
            <p>
              Für die Zahlungsabwicklung nutzen wir Stripe. Im Zahlungsprozess können insbesondere
              Name, E-Mail-Adresse, Rechnungsadresse, Zahlungsbetrag, Währung, Transaktionsdaten,
              Zahlungsinstrument- und Geräteinformationen verarbeitet werden. Zahlungsdaten werden
              abhängig von der gewählten Zahlungsart unmittelbar durch Stripe verarbeitet;
              vollständige Karteninformationen erhalten wir in der Regel nicht.
            </p>
            <p>
              Die Verarbeitung ist zur Durchführung des Vertrages und der von Ihnen gewählten
              Zahlung erforderlich und erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Soweit
              Stripe Daten für eigene gesetzliche Pflichten, Betrugsprävention, Sicherheit oder
              regulatorische Zwecke in eigener Verantwortlichkeit verarbeitet, gelten ergänzend die
              Datenschutzinformationen von Stripe. Stripe ist international tätig; personenbezogene
              Daten können unter Beachtung der anwendbaren Transfermechanismen auch außerhalb des
              EWR verarbeitet werden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">9. Versand mit DHL</h2>
            <p>
              Zur Auslieferung Ihrer Bestellung übermitteln wir die für den Versand erforderlichen
              Daten an DHL, insbesondere Name und Lieferanschrift sowie – soweit für die gewählte
              Versandoption erforderlich und zulässig – E-Mail-Adresse und/oder Telefonnummer.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Soweit zusätzliche
              Zustellbenachrichtigungen oder optionale Empfangsservices nur mit gesonderter
              Einwilligung angeboten werden, erfolgt die entsprechende Verarbeitung auf Art. 6 Abs.
              1 lit. a DSGVO.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              10. E-Mail-Kommunikation und Newsletter mit Resend
            </h2>
            <p>
              Wir nutzen den Dienst Resend der Plus Five Five, Inc. zum Versand von
              technischen/transaktionalen E-Mails sowie von Newslettern. Zu den verarbeiteten Daten
              gehören E-Mail-Adresse, Name, Nachrichteninhalte, Metadaten und Zustellinformationen.
              Nach Angaben von Resend erfolgen wesentliche Verarbeitungsschritte in den USA; als
              Übermittlungsmechanismen nutzt Resend Standardvertragsklauseln sowie die Teilnahme am
              EU–U.S. Data Privacy Framework.
            </p>
            <p>Double-Opt-In & Tracking:</p>
            <p>
              Die Anmeldung zu unserem Newsletter erfolgt in einem sog. Double-Opt-In-Verfahren. Sie
              erhalten nach der Anmeldung eine E-Mail, in der Sie um die Bestätigung Ihrer Anmeldung
              gebeten werden. Unsere über Resend versendeten Newsletter enthalten Analyse-Funktionen
              (wie Web-Beacons/Pixel), mit denen wir feststellen können, ob eine E-Mail geöffnet und
              welche Links angeklickt wurden. Diese Auswertung dient ausschließlich der
              Reichweitenmessung und der Optimierung unserer Inhalte.
            </p>
            <p>Rechtsgrundlagen:</p>
            <p>
              Transaktions-E-Mails (z. B. Bestell- oder Service-Informationen) werden auf Grundlage
              von Art. 6 Abs. 1 lit. b DSGVO bzw. Art. 6 Abs. 1 lit. c DSGVO verarbeitet. Der
              Newsletter-Versand sowie die dazugehörige Erfolgsmessung erfolgen ausschließlich auf
              Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie können Ihre
              Einwilligung jederzeit mit Wirkung für die Zukunft über den Abmeldelink in jedem
              Newsletter oder per E-Mail an info@eledesign.de widerrufen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">11. Kontaktaufnahme</h2>
            <p>
              Wenn Sie uns per E-Mail, Telefon oder über ein Kontaktformular kontaktieren,
              verarbeiten wir die von Ihnen mitgeteilten Daten zur Bearbeitung Ihrer Anfrage.
              Bezieht sich die Anfrage auf einen Vertrag oder vorvertragliche Maßnahmen, ist
              Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO; in anderen Fällen Art. 6 Abs. 1 lit. f
              DSGVO aufgrund unseres berechtigten Interesses an einer effizienten Bearbeitung von
              Anfragen. Soweit eine Einwilligung eingeholt wird, ist Art. 6 Abs. 1 lit. a DSGVO
              Rechtsgrundlage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              12. Empfänger und internationale Datenübermittlungen
            </h2>
            <p>
              Wir geben personenbezogene Daten nur weiter, soweit dies für die jeweiligen Zwecke
              erforderlich und rechtlich zulässig ist. Empfänger können insbesondere Hosting- und
              Infrastrukturprovider, Zahlungsdienstleister, Versanddienstleister,
              E-Mail-Dienstleister, Analyseanbieter, IT-Dienstleister und die im Rahmen der
              KI-Gartengestaltung eingesetzten Anbieter sein.
            </p>
            <p>
              Bei Übermittlungen in Staaten außerhalb der EU/des EWR stellen wir – soweit gesetzlich
              erforderlich – sicher, dass die Voraussetzungen der Art. 44 ff. DSGVO erfüllt sind,
              etwa durch einen Angemessenheitsbeschluss, die Teilnahme eines Empfängers am EU–U.S.
              Data Privacy Framework oder geeignete Garantien wie Standardvertragsklauseln.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">13. Speicherdauer</h2>
            <p>
              Wir speichern personenbezogene Daten grundsätzlich nur so lange, wie dies für den
              jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
              Nach Wegfall des Zwecks werden Daten gelöscht oder gesperrt, sofern keine gesetzliche
              Grundlage für eine weitere Speicherung besteht. Vertrags-, Rechnungs- und
              Buchungsdaten können entsprechend handels- und steuerrechtlichen Vorgaben mehrere
              Jahre aufbewahrt werden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">14. Ihre Rechte</h2>
            <p>
              Sie haben nach Maßgabe der gesetzlichen Voraussetzungen insbesondere das Recht auf
              Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO),
              Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO)
              sowie Widerspruch gegen bestimmte Verarbeitungen (Art. 21 DSGVO). Erteilte
              Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7
              Abs. 3 DSGVO).
            </p>
            <p>
              Sie haben außerdem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren
              (Art. 77 DSGVO). Zuständig kann insbesondere die Datenschutzaufsichtsbehörde des
              Bundeslandes sein, in dem unser Unternehmen seinen Sitz hat; Sie können sich jedoch
              auch an eine andere für Sie zuständige Aufsichtsbehörde wenden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">15. Widerspruchsrecht</h2>
            <p>
              Soweit wir personenbezogene Daten auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO
              verarbeiten, haben Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
              jederzeit das Recht, gegen die Verarbeitung Widerspruch einzulegen. Werden
              personenbezogene Daten für Direktwerbung verarbeitet, haben Sie jederzeit das Recht,
              der Verarbeitung zum Zwecke derartiger Werbung zu widersprechen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">16. Datensicherheit</h2>
            <p>
              Wir treffen angemessene technische und organisatorische Maßnahmen, um personenbezogene
              Daten gegen Verlust, Manipulation, unberechtigten Zugriff und sonstige Risiken zu
              schützen. Die Datenübertragung über unsere Website erfolgt grundsätzlich verschlüsselt
              (TLS/HTTPS).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              17. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Wir können diese Datenschutzerklärung anpassen, wenn sich unsere Website, eingesetzte
              Dienste, Verarbeitungsprozesse oder rechtliche Anforderungen ändern. Maßgeblich ist
              die jeweils auf www.eledesign.de veröffentlichte Fassung.
            </p>
          </section>
        </article>
      ) : (
        <article className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mb-8">Version date: 10 September 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">1. Controller</h2>
            <p>
              The controller within the meaning of the General Data Protection Regulation (GDPR) and
              other applicable data-protection laws is:
            </p>
            <p className="m-0 font-medium">Stauden Peters Pflanzenvertriebs GmbH</p>
            <p className="m-0">Drüller Weg 14</p>
            <p className="m-0">47559 Kranenburg</p>
            <p className="m-0">Germany</p>
            <p className="m-0">Phone: +49 (0)2826 9150-0</p>
            <p className="m-0">Email: info@eledesign.de</p>
            <p className="m-0">Website: www.eledesign.de</p>
            <p className="mt-2 text-sm text-neutral-600">
              eledesign is a brand of Stauden Peters Pflanzenvertriebs GmbH.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              2. General information on data processing
            </h2>
            <p>
              We process personal data only to the extent necessary to operate our website, provide
              our services, process orders and enquiries, perform contracts, handle payments and
              shipping, communicate with customers and – where you have consented – perform
              analytics and marketing activities.
            </p>
            <p>
              Depending on the processing activity, the legal bases include in particular Article
              6(1)(a) GDPR (consent), Article 6(1)(b) GDPR (contract or pre-contractual steps),
              Article 6(1)(c) GDPR (legal obligation) and Article 6(1)(f) GDPR (legitimate
              interests). Where information is stored on or accessed from your terminal equipment,
              Section 25 TDDDG also applies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              3. Hosting, content delivery and technical infrastructure
            </h2>
            <p>
              Based on the information provided to us, eledesign uses Vercel, IONOS and Cloudflare
              for technical operation. When you access the website, technically necessary
              information may be processed, including IP address, date and time of access, requested
              URL or file, referrer URL, browser and device information, operating system, and
              technical status and log data. This processing serves to deliver the website, ensure
              stability and security, diagnose errors and prevent misuse.
            </p>
            <p>
              The legal basis is Article 6(1)(f) GDPR. Our legitimate interest is the secure, stable
              and efficient operation of our online service. Where processing is necessary to
              perform a contract requested by you or to take pre-contractual steps, Article 6(1)(b)
              GDPR also applies.
            </p>
            <p>
              Vercel and Cloudflare operate internationally. Personal data may therefore be
              transferred to third countries, particularly the United States. According to their
              publicly available information, Vercel and Cloudflare rely, where applicable, on
              mechanisms including the EU–U.S. Data Privacy Framework and/or Standard Contractual
              Clauses. Based on the information available, IONOS provides for processor arrangements
              under Article 28 GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              4. Cookies, local storage and consent management
            </h2>
            <p>
              We use Silktide Consent Manager to manage your choices regarding non-essential
              technologies. According to Silktide documentation, the Consent Manager stores your
              choice in your browser’s local storage so that it can be restored on later visits and
              changed by you.
            </p>
            <p>
              Storage or access that is strictly necessary may be based on Section 25(2) TDDDG.
              Non-essential technologies, particularly analytics or marketing technologies, are
              activated only with your consent under Section 25(1) TDDDG and Article 6(1)(a) GDPR.
              You may withdraw or change your consent at any time with future effect through the
              privacy/consent settings provided on the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">5. Google Analytics</h2>
            <p>
              Where you have consented via the Consent Manager, we use Google Analytics to measure
              reach and analyse the use of our website. For European users, the relevant provider is
              generally Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland;
              other Google companies may be involved in providing the service.
            </p>
            <p>
              Data processed may include information about page views, interactions, approximate
              location, browser, device, operating system, referrer, session and event data.
              According to Google, individual IP addresses of users in the EU, Switzerland and the
              United Kingdom are not logged or stored and are discarded before logging. Data may
              nevertheless be processed internationally within Google’s infrastructure.
            </p>
            <p>Data Retention:</p>
            <p>
              Event-level data (such as page views and interaction events) is retained for 2 months
              and automatically deleted thereafter. User-level identifiers are retained for 14
              months, with the retention timer resetting upon new activity prior to expiration.
            </p>
            <p>Advertising Features & Signals:</p>
            <p>
              Google Signals and personalized advertising features are disabled. We do not use
              Google Analytics for remarketing or cross-device advertising profiling.
            </p>
            <p>
              The legal basis is your consent under Article 6(1)(a) GDPR and, for non-essential
              storage/access on terminal equipment, Section 25(1) TDDDG. You may withdraw your
              consent at any time through the privacy settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              6. AI-assisted garden design with Neighborbrite
            </h2>
            <p>
              eledesign offers an AI-assisted garden and landscape-design function in collaboration
              with Neighborbrite Inc. You may upload a photograph of your garden, terrace or other
              outdoor area and provide design instructions. Neighborbrite processes these inputs to
              generate automated design suggestions and visualisations. Independently of the AI
              function, customers may also select and purchase ready-made garden concepts and
              products directly through www.eledesign.de.
            </p>
            <p>
              According to the information you supplied, Neighborbrite uses a proprietary AI
              orchestration system consisting of an evolving ensemble of models. Different models
              may analyse the outdoor space, apply landscape-design principles, select plants,
              develop the composition and generate the visualisation. The specific models or
              third-party providers may change over time.
            </p>
            <p>
              Data processed may include the uploaded image, design instructions and prompts,
              generated outputs, technical usage/session data and a pseudonymous session identifier.
              Based on the information provided, users of the Neighborbrite experience embedded in
              eledesign do not need a separate Neighborbrite account.
            </p>
            <p>
              The purpose of processing is to provide the AI design function requested by you and,
              if you subsequently decide to purchase, to enable the technical handoff to eledesign
              so that you can continue the order process. The legal basis is Article 6(1)(b) GDPR
              where processing is necessary to provide the requested service or take pre-contractual
              steps. Where consent is required for optional technologies, Article 6(1)(a) GDPR
              together with Section 25(1) TDDDG applies.
            </p>
            <p>
              According to the information supplied to us, images may be processed or stored outside
              the EU/EEA, including in the United States. Neighborbrite’s current public Privacy
              Policy also states that its sites are hosted in the United States and that personal
              data may be transferred there.
            </p>
            <p>
              According to the information you supplied, uploaded images are retained for as long as
              Neighborbrite considers reasonably necessary to provide, maintain, evaluate and
              improve the service; there is currently no fixed automatic expiration period. Deletion
              requests may be sent to privacy@neighborbrite.com.
            </p>
            <p>
              Also according to the information you supplied, customer images may be used by
              Neighborbrite to evaluate, improve and train its own systems and services. When
              selecting external models or service providers, Neighborbrite states that it generally
              prefers providers that do not use submitted customer data to train their own models,
              but the specific providers and terms may change. If you use Neighborbrite through its
              own app or website, Neighborbrite's own privacy policy additionally applies to the
              processing carried out there.
            </p>
            <p className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-sm">
              Where possible, please upload images that do not contain identifiable people, vehicle
              registration plates, house numbers or other unnecessary personal information. If
              images show other individuals, please ensure that you are entitled to submit them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              7. Customer accounts, guest checkout and order processing
            </h2>
            <p>
              You may purchase ready-made garden concepts and products directly through eledesign.
              Alternatively, you may first design your garden using the Neighborbrite function
              embedded in eledesign or through a Neighborbrite app. If, after finalising the design,
              you decide to proceed with a purchase, Neighborbrite provides a purchase link/URL to
              eledesign or redirects you to eledesign through that link. The actual order, selection
              or confirmation of the products to be purchased, entry of billing and delivery
              details, payment and order confirmation then take place through eledesign. The
              contractual partner for the purchase and order fulfilment is Stauden Peters
              Pflanzenvertriebs GmbH, which operates the eledesign brand. Stauden Peters
              Pflanzenvertriebs GmbH fulfils the order and arranges delivery. In connection with
              registration, ordering and contract performance, we process data such as name, billing
              and delivery address, email address, telephone number (where provided or required for
              delivery), order and product information, payment status, communications and, where
              applicable, account and login data.
            </p>
            <p>
              Processing is necessary for pre-contractual steps and performance of the purchase
              contract under Article 6(1)(b) GDPR. Where statutory retention and evidence
              obligations apply, continued storage is based on Article 6(1)(c) GDPR. Under current
              German commercial and tax rules, accounting vouchers are generally retained for eight
              years, while certain other business records may be subject to six- or ten-year
              periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">8. Payments with Stripe</h2>
            <p>
              We use Stripe for payment processing. During payment, data such as name, email
              address, billing address, payment amount, currency, transaction information,
              payment-instrument and device information may be processed. Depending on the payment
              method, payment credentials are processed directly by Stripe; as a rule, we do not
              receive complete card details.
            </p>
            <p>
              Processing is necessary to perform the contract and the payment method selected by you
              under Article 6(1)(b) GDPR. Where Stripe processes data under its own responsibility
              for legal obligations, fraud prevention, security or regulatory purposes, Stripe’s
              privacy information also applies. Stripe operates internationally and may process
              personal data outside the EEA using the applicable transfer mechanisms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">9. Shipping with DHL</h2>
            <p>
              To deliver your order, we transfer the data required for shipping to DHL, in
              particular your name and delivery address and – where required and legally permissible
              for the selected delivery option – your email address and/or telephone number. The
              legal basis is Article 6(1)(b) GDPR. Where optional delivery notifications or
              recipient services require separate consent, the relevant processing is based on
              Article 6(1)(a) GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              10. Email communications and newsletters via Resend
            </h2>
            <p>
              We use Resend, a service provided by Plus Five Five, Inc., to send technical and
              transactional emails as well as marketing newsletters. Data processed includes email
              address, name, message content, metadata, and delivery information. According to
              Resend's public disclosures, key processing operations take place in the United
              States; Resend relies on Standard Contractual Clauses and its certification under the
              EU–U.S. Data Privacy Framework as transfer mechanisms.
            </p>
            <p>Double Opt-In & Tracking:</p>
            <p>
              Newsletter subscriptions are completed using a double opt-in procedure. You will
              receive a confirmation email to confirm your email address before receiving marketing
              communications. Our newsletters sent via Resend contain tracking technologies (such as
              web beacons/pixels) that allow us to collect performance data, including whether an
              email was opened and which links were clicked. This analytics data is processed solely
              to evaluate campaign performance and improve our content.
            </p>
            <p>Legal Basis:</p>
            <p>
              Transactional emails (e.g., service notifications or order details) are processed
              under Article 6(1)(b) GDPR or Article 6(1)(c) GDPR. Newsletters and email performance
              tracking are carried out exclusively on the basis of your explicit consent under
              Article 6(1)(a) GDPR. You may withdraw your consent at any time with future effect by
              using the unsubscribe link in any newsletter or by emailing info@eledesign.de.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">11. Contacting us</h2>
            <p>
              If you contact us by email, telephone or contact form, we process the information you
              provide in order to handle your enquiry. Where the enquiry concerns a contract or
              pre-contractual steps, the legal basis is Article 6(1)(b) GDPR; otherwise it is
              Article 6(1)(f) GDPR based on our legitimate interest in efficiently handling
              enquiries. Where consent is obtained, Article 6(1)(a) GDPR applies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              12. Recipients and international transfers
            </h2>
            <p>
              We disclose personal data only where necessary for the relevant purpose and legally
              permitted. Recipients may include hosting and infrastructure providers, payment
              providers, shipping providers, email providers, analytics providers, IT service
              providers and providers involved in the AI garden-design function.
            </p>
            <p>
              For transfers to countries outside the EU/EEA, we ensure – where required by law –
              that the requirements of Articles 44 et seq. GDPR are met, for example through an
              adequacy decision, a recipient’s participation in the EU–U.S. Data Privacy Framework,
              or appropriate safeguards such as Standard Contractual Clauses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">13. Retention periods</h2>
            <p>
              We generally retain personal data only for as long as necessary for the relevant
              purpose or as required by statutory retention obligations. Once the purpose no longer
              applies, data is deleted or restricted unless there is a legal basis for continued
              storage. Contract, invoice and accounting data may be retained for several years under
              commercial and tax law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">14. Your rights</h2>
            <p>
              Subject to the statutory requirements, you have rights including access (Article 15
              GDPR), rectification (Article 16), erasure (Article 17), restriction of processing
              (Article 18), data portability (Article 20) and objection to certain processing
              (Article 21). You may withdraw consent at any time with future effect (Article 7(3)).
            </p>
            <p>
              You also have the right to lodge a complaint with a data-protection supervisory
              authority (Article 77 GDPR). In particular, you may contact the authority responsible
              for the federal state in which our company is established, or another supervisory
              authority competent for you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">15. Right to object</h2>
            <p>
              Where we process personal data on the basis of Article 6(1)(e) or (f) GDPR, you have
              the right to object at any time on grounds relating to your particular situation.
              Where personal data is processed for direct marketing, you have the right to object at
              any time to processing for such marketing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">16. Data security</h2>
            <p>
              We use appropriate technical and organisational measures to protect personal data
              against loss, manipulation, unauthorised access and other risks. Data transmitted
              through our website is generally encrypted using TLS/HTTPS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">17. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy if our website, service providers, processing
              activities or legal requirements change. The version published on www.eledesign.de is
              the applicable version.
            </p>
          </section>
        </article>
      )}
    </main>
  )
}
