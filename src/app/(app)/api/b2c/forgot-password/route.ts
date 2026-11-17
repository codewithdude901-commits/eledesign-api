import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  requestB2CPasswordResetToken,
  sendB2CPasswordResetEmail,
} from '@/b2c/emails/sendB2CPasswordReset'

type B2CUser = {
  accountType?: string | null
  email?: null | string
  roles?: string[] | null
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; locale?: unknown }
    | null
  const email =
    body && typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  const locale: 'de' | 'en' =
    body && (body.locale === 'en' || body.locale === 'de') ? body.locale : 'de'

  const genericResponse = NextResponse.json({
    message:
      'If an account exists for this email, a password reset link has been sent.',
  })

  if (!email) return genericResponse

  try {
    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: email,
        },
      } as never,
    })

    const user = users.docs[0] as unknown as B2CUser | undefined
    const roles = Array.isArray(user?.roles) ? user.roles : []
    const isB2C = roles.includes('customer') && !roles.includes('admin')

    if (user && isB2C) {
      const token = await requestB2CPasswordResetToken({ email, payload })

      if (token) {
        await sendB2CPasswordResetEmail({
          email,
          locale,
          payload,
          token,
        })
      }
    }
  } catch {
    // Always return the generic response to avoid account enumeration.
  }

  return genericResponse
}
