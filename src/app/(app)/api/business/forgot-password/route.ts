import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  requestBusinessPasswordResetToken,
  sendBusinessPasswordResetEmail,
} from '@/b2b/emails/sendBusinessPasswordReset'

type B2BUser = {
  b2b?: {
    preferredLocale?: 'de' | 'en' | null
    status?: 'approved' | 'pending' | 'suspended' | null
  } | null
  email?: null | string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null
  const email =
    body && typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''

  const genericResponse = NextResponse.json({
    message:
      'If an approved business account exists for this email, a password reset link has been sent.',
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
        accountType: {
          equals: 'b2b',
        },
        email: {
          equals: email,
        },
      } as never,
    })

    const user = users.docs[0] as unknown as B2BUser | undefined

    if (user?.b2b?.status === 'approved') {
      const token = await requestBusinessPasswordResetToken({ email, payload })

      if (token) {
        await sendBusinessPasswordResetEmail({
          email,
          locale: user.b2b?.preferredLocale === 'en' ? 'en' : 'de',
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
