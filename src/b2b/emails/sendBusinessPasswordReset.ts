import type { Payload, PayloadRequest } from 'payload'

const getResetURL = (token: string, locale: 'de' | 'en'): string => {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const path =
    locale === 'en'
      ? `/en/business/reset-password?token=${encodeURIComponent(token)}`
      : `/business/reset-password?token=${encodeURIComponent(token)}`

  return `${serverURL}${path}`
}

export const requestBusinessPasswordResetToken = async ({
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

export const sendBusinessPasswordResetEmail = async ({
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
    locale === 'en'
      ? 'Set your business account password'
      : 'Passwort für Ihr Geschäftskundenkonto festlegen'

  const html =
    locale === 'en'
      ? `<p>Your business partner account has been approved.</p><p><a href="${resetURL}">Set your password</a></p><p>If the button does not work, open this link:</p><p>${resetURL}</p>`
      : `<p>Ihr Geschäftskundenkonto wurde freigegeben.</p><p><a href="${resetURL}">Passwort festlegen</a></p><p>Falls der Link nicht funktioniert, öffnen Sie:</p><p>${resetURL}</p>`

  try {
    await payload.sendEmail({
      html,
      subject,
      to: email,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to send business password reset email' })
  }
}

export const sendBusinessPasswordReset = async ({
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
  const token = await requestBusinessPasswordResetToken({ email, payload, req })

  if (!token) return

  await sendBusinessPasswordResetEmail({
    email,
    locale,
    payload,
    token,
  })
}
