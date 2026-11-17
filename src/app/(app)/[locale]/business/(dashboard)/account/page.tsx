import { BusinessAccountForm } from '@/components/business/BusinessAccountForm'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessAccountPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">{locale === 'de' ? 'Konto' : 'Account'}</h1>
        <p className="mt-1 text-sm text-primary/60">
          {locale === 'de'
            ? 'Verwalten Sie Ihre Kontaktdaten und Rechnungsinformationen.'
            : 'Manage your contact details and invoice information.'}
        </p>
      </div>

      <BusinessAccountForm locale={locale} />
    </div>
  )
}
