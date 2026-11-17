import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { token } = await searchParams

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">
        {locale === 'de' ? 'Neues Passwort festlegen' : 'Set a new password'}
      </h1>

      {!token ? (
        <div className="mt-8 rounded-none border border-red-300 bg-red-50 p-5 text-sm text-red-800">
          <p>
            {locale === 'de'
              ? 'Der Link ist ungültig oder abgelaufen.'
              : 'The link is invalid or has expired.'}
          </p>
          <Link
            className="mt-3 inline-block underline underline-offset-4"
            href={`/${locale}/forgot-password`}
          >
            {locale === 'de' ? 'Neuen Link anfordern' : 'Request a new link'}
          </Link>
        </div>
      ) : (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{locale === 'de' ? 'Passwort' : 'Password'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm locale={locale} token={token} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
