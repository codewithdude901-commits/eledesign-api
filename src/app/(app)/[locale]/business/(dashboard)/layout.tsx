import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { BusinessNav } from '@/components/business/BusinessNav'
import type { User } from '@/payload-types'

type Props = {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function BusinessDashboardLayout({ children, params }: Props) {
  const { locale } = await params
  const businessLocale: 'de' | 'en' = locale === 'en' ? 'en' : 'de'
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const businessUser = user as User | null

  if (
    !businessUser ||
    businessUser.accountType !== 'b2b' ||
    businessUser.b2b?.status !== 'approved'
  ) {
    const warning =
      businessLocale === 'de'
        ? 'Bitte melden Sie sich mit einem freigegebenen Geschäftskundenkonto an.'
        : 'Please sign in with an approved business account.'

    redirect(`/${businessLocale}/business/login?warning=${encodeURIComponent(warning)}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BusinessNav
        companyName={businessUser.b2b?.companyName}
        locale={businessLocale}
        vatId={businessUser.b2b?.vatId}
      />
      <main className="mt-8">{children}</main>
    </div>
  )
}
