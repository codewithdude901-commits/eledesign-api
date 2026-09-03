'use client'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { Fragment, useEffect, useState } from 'react'

export const LogoutPage: React.FC = (props) => {
  const { logout } = useAuth()
  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess(locale === 'de' ? 'Erfolgreich abgemeldet.' : 'Logged out successfully.')
      } catch (_) {
        setError(locale === 'de' ? 'Sie sind bereits abgemeldet.' : 'You are already logged out.')
      }
    }

    void performLogout()
  }, [logout])

  return (
    <Fragment>
      {(error || success) && (
        <div className="prose dark:prose-invert">
          <h1>{error || success}</h1>
          <p>
            {locale === 'de'
              ? 'Was möchten Sie als Nächstes tun?'
              : 'What would you like to do next?'}
            <Fragment>
              {' '}
              <Link href={`/${locale}/gardens`}>
                {locale === 'de' ? 'Hier klicken' : 'Click here'}
              </Link>
              {locale === 'de' ? ' um zu shoppen.' : ' to shop.'}
            </Fragment>
            {locale === 'de' ? ` Um erneut einzuloggen, ` : ` To log back in, `}
            <Link href={`/${locale}/login`}>{locale === 'de' ? 'Hier klicken' : 'click here'}</Link>
            .
          </p>
        </div>
      )}
    </Fragment>
  )
}
