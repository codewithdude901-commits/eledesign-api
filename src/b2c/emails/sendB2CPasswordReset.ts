import type { Payload, PayloadRequest } from 'payload'

const getResetURL = (token: string, locale: 'de' | 'en'): string => {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const path =
    locale === 'en'
      ? `/en/reset-password?token=${encodeURIComponent(token)}`
      : `/reset-password?token=${encodeURIComponent(token)}`

  return `${serverURL}${path}`
}

export const requestB2CPasswordResetToken = async ({
  email,
  payload,
  req,
}: {
  email: string
  payload: Payload
  req?: Partial<PayloadRequest>
}): Promise<null | string> => {
  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email },
    disableEmail: true,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  return token || null
}

export const sendB2CPasswordResetEmail = async ({
  email,
  locale = 'de',
  payload,
  token,
}: {
  email: string
  locale?: 'de' | 'en'
  payload: Payload
  token: string
}): Promise<void> => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return
  }

  const resetURL = getResetURL(token, locale)

  const subject =
    locale === 'en' ? 'Reset your password' : 'Passwort zurücksetzen'

  const html =
    locale === 'en'
      ? `<p>You requested a password reset.</p><p><a href="${resetURL}">Reset your password</a></p><p>If the button does not work, open this link:</p><p>${resetURL}</p>`
      : `<p>Sie haben ein Zurücksetzen Ihres Passworts angefordert.</p><p><a href="${resetURL}">Passwort zurücksetzen</a></p><p>Falls der Link nicht funktioniert, öffnen Sie:</p><p>${resetURL}</p>`

  try {
    await payload.sendEmail({
      html,
      subject,
      to: email,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to send B2C password reset email' })
  }
}

export const sendB2CPasswordReset = async ({
  email,
  locale = 'de',
  payload,
  req,
}: {
  email: string
  locale?: 'de' | 'en'
  payload: Payload
  req?: Partial<PayloadRequest>
}): Promise<void> => {
  const token = await requestB2CPasswordResetToken({ email, payload, req })

  if (!token) return

  await sendB2CPasswordResetEmail({
    email,
    locale,
    payload,
    token,
  })
}
