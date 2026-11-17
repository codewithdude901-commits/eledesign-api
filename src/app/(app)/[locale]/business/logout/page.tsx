import { BusinessLogoutButton } from '@/components/business/BusinessLogoutButton'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessLogoutPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">
        {locale === 'de' ? 'Vom B2B-Portal abmelden' : 'Sign out of the B2B portal'}
      </h1>
      <p className="mt-2 text-sm text-primary/60">
        {locale === 'de'
          ? 'Sie werden abgemeldet und zur Anmeldung weitergeleitet.'
          : 'You will be signed out and redirected to the login page.'}
      </p>
      <div className="mt-8">
        <BusinessLogoutButton locale={locale} />
      </div>
    </div>
  )
}
