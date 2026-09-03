import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

type Props = {
  params: Promise<{
    locale: string
  }>
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="container py-16">
      <ForgotPasswordForm locale={locale} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Enter your email address to recover your password.',
  openGraph: mergeOpenGraph({
    title: 'Forgot Password',
    url: '/forgot-password',
  }),
  title: 'Forgot Password',
}
