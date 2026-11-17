import Link from 'next/link'

import { BusinessApplicationForm } from '@/components/business/BusinessApplicationForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessApplyPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">
          {locale === 'de' ? 'Geschäftskunden' : 'Business partners'}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {locale === 'de' ? 'Geschäftspartner werden' : 'Become a business partner'}
        </h1>
        <p className="mt-2 text-sm text-primary/60">
          {locale === 'de'
            ? 'Bewerben Sie sich für den Zugang zu Nettopreisen, Rechnungskauf und unserem B2B-Portal.'
            : 'Apply for access to net pricing, invoice payment and our B2B portal.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'de' ? 'Bewerbung' : 'Application'}</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessApplicationForm locale={locale} />
        </CardContent>
      </Card>

      <Link
        className="mt-6 inline-block text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
        href={`/${locale}/business/login`}
      >
        {locale === 'de' ? 'Sie haben bereits ein Konto? Anmelden' : 'Already have an account? Sign in'}
      </Link>
    </div>
  )
}
