import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import { BusinessLoginForm } from '@/components/business/BusinessLoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/payload-types'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
  searchParams: Promise<{
    warning?: string
  }>
}

export default async function BusinessLoginPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { warning } = await searchParams
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User | null

  if (businessUser?.accountType === 'b2b' && businessUser.b2b?.status === 'approved') {
    redirect(`/${locale}/business/dashboard`)
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">
          {locale === 'de' ? 'Geschäftskunden' : 'Business partners'}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {locale === 'de' ? 'B2B-Portal Anmeldung' : 'B2B portal sign in'}
        </h1>
        <p className="mt-2 text-sm text-primary/60">
          {locale === 'de'
            ? 'Melden Sie sich mit Ihrem freigegebenen Geschäftskundenkonto an.'
            : 'Sign in with your approved business account.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'de' ? 'Anmelden' : 'Sign in'}</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessLoginForm locale={locale} warning={warning} />
        </CardContent>
      </Card>

      <Link
        className="text-sm text-primary/60 underline-offset-4 hover:text-primary hover:underline"
        href={`/${locale}`}
      >
        {locale === 'de' ? 'Zurück zum Shop' : 'Back to shop'}
      </Link>
    </div>
  )
}
