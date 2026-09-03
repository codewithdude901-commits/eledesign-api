import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'

import { LoginForm } from '@/components/forms/LoginForm'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function Login({ params }: Props) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const { locale } = await params

  if (user) {
    redirect(
      `/account?warning=${encodeURIComponent(locale === 'de' ? 'Sie sind bereits eingeloggt.' : 'You are already logged in.')}`,
    )
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-4 text-[1.8rem]">Log in</h1>
        <p className="mb-8">
          {locale === 'de'
            ? 'Hier können Ihre Kunden sich einloggen, um ihr Konto zu verwalten, ihre Bestellhistorie zu durchsuchen und mehr.'
            : 'This is where your customers will login to manage their account, review their order history, and more.'}
        </p>
        <LoginForm locale={locale} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Login or create an account to get started.',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
  title: 'Login',
}
