import { BusinessForgotPasswordForm } from '@/components/business/BusinessForgotPasswordForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessForgotPasswordPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">
        {locale === 'de' ? 'Passwort zurücksetzen' : 'Reset your password'}
      </h1>
      <p className="mt-2 text-sm text-primary/60">
        {locale === 'de'
          ? 'Geben Sie die E-Mail-Adresse Ihres Geschäftskontos ein.'
          : 'Enter the email address of your business account.'}
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{locale === 'de' ? 'Passwort vergessen' : 'Forgot password'}</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForgotPasswordForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  )
}
