import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessAddressesPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{locale === 'de' ? 'Adressen' : 'Addresses'}</h1>
          <p className="mt-1 text-sm text-primary/60">
            {locale === 'de'
              ? 'Rechnungs- und Lieferadressen für Ihre Bestellungen.'
              : 'Billing and shipping addresses for your orders.'}
          </p>
        </div>
        <CreateAddressModal locale={locale} />
      </div>

      <div className="rounded-none border bg-white p-6">
        <AddressListing locale={locale} />
      </div>
    </div>
  )
}
