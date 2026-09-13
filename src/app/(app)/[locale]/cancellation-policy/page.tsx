import { Metadata } from 'next'
import React from 'react'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'de' ? 'Widerrufsbelehrung | EleDesign' : 'Right of Withdrawal & Returns | EleDesign',
    description: locale === 'de' ? 'Gesetzliches 14-tägiges Widerrufsrecht für EleDesign.' : '14-day statutory right of withdrawal and return policy for EleDesign.',
  }
}

export default async function CancellationPolicyPage({ params }: Props) {
  const { locale } = await params

  if (locale === 'de') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
          Widerrufsbelehrung
        </h1>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Widerrufsrecht</h2>
            <p className="mb-4">
              Sie haben das Recht, binnen <strong>14 Tagen</strong> ohne Angabe von Gründen diesen Vertrag zu widerrufen.
            </p>
            <p>
              Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Ausübung des Widerrufs</h2>
            <p className="mb-4">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:
            </p>
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-md mb-4 font-mono text-xs sm:text-sm">
              <p className="font-bold">EleDesign</p>
              <p>E-Mail: info@eledesign.de</p>
            </div>
            <p>
              mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Folgen des Widerrufs</h2>
            <p className="mb-4">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen 14 Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p className="mb-4">
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben.
            </p>
            <p>
              Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen 14 Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-stone-900">Rücksendekosten</h2>
            <p>
              Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-stone-800">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
        Right of Withdrawal &amp; Returns (Widerrufsbelehrung)
      </h1>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Right of Withdrawal</h2>
          <p className="mb-4">
            You have the right to withdraw from this contract within <strong>14 days</strong> without giving any reason.
          </p>
          <p>
            The withdrawal period will expire after 14 days from the day on which you, or a third party indicated by you (other than the carrier), acquire physical possession of the goods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Exercising Your Right</h2>
          <p className="mb-4">
            To exercise the right of withdrawal, you must inform us:
          </p>
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-md mb-4 font-mono text-xs sm:text-sm">
            <p className="font-bold">EleDesign</p>
            <p>Email: info@eledesign.de</p>
          </div>
          <p>
            of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or an email). To meet the withdrawal deadline, it is sufficient for you to send your communication before the 14-day period has expired.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Effects of Withdrawal</h2>
          <p className="mb-4">
            If you withdraw from this contract, we shall reimburse to you all payments received from you, including standard delivery costs, without undue delay and no later than 14 days from the day on which we are informed about your decision.
          </p>
          <p className="mb-4">
            We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise. We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods.
          </p>
          <p>
            You shall send back the goods without undue delay and in any event not later than 14 days from the day on which you communicate your withdrawal to us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-stone-900">Return Shipping Costs</h2>
          <p>
            You will have to bear the direct cost of returning the goods.
          </p>
        </section>
      </div>
    </main>
  )
}