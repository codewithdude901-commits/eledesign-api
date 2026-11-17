import crypto from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import { requestBusinessPasswordResetToken } from '@/b2b/emails/sendBusinessPasswordReset'

type Application = {
  companyName: string
  contactName: string
  email: string
  id: number | string
  phone?: null | string
  status?: 'approved' | 'pending' | 'rejected' | null
  user?: unknown
  vatId?: null | string
  website?: null | string
}

type ExistingUser = {
  b2b?: Record<string, unknown> | null
  email?: null | string
  id: number | string
  roles?: null | string[]
}

type ApprovalTokenEntry = {
  email: string
  locale: 'de' | 'en'
  token: null | string
}

export const approveApplication: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const incoming = data as Partial<Application>
  const previous = originalDoc as Application | undefined

  if (
    operation !== 'update' ||
    incoming.status !== 'approved' ||
    previous?.status === 'approved'
  ) {
    return data
  }

  const application = {
    ...(previous || {}),
    ...incoming,
  } as Application

  if (application.user) {
    return data
  }

  const email = (application.email || '').toLowerCase().trim()

  if (!email) {
    throw new APIError('The application does not contain an email address.', 400)
  }

  if (!application.id) {
    throw new APIError('The application could not be identified.', 400)
  }

  const payload = req.payload

  const existingUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      email: {
        equals: email,
      },
    },
  })

  const existingUser = existingUsers.docs[0] as unknown as ExistingUser | undefined

  if (existingUser?.roles?.includes('admin')) {
    throw new APIError(
      'A user with this email is already an administrator. Review this application manually.',
      400,
    )
  }

  const b2bData = {
    approvedAt: new Date().toISOString(),
    approvedBy: req.user?.id,
    companyName: application.companyName,
    contactPhone: application.phone || undefined,
    invoiceEmail: application.email,
    preferredLocale: 'de' as const,
    status: 'approved' as const,
    vatId: application.vatId || undefined,
    website: application.website || undefined,
  }

  let userID: string

  if (!req.context) {
    req.context = {}
  }

  // `guardB2BUserCreate` must not downgrade the account while this hook
  // creates it as part of an approved application.
  req.context.b2bApproval = true

  try {
    if (existingUser) {
      const updatedUser = (await payload.update({
        collection: 'users',
        data: {
          accountType: 'b2b',
          b2b: {
            ...(existingUser.b2b || {}),
            ...b2bData,
          },
          roles: Array.from(
            new Set([...(existingUser.roles || []), 'customer', 'b2b']),
          ) as ('admin' | 'b2b' | 'customer')[],
        },
        id: existingUser.id,
        overrideAccess: true,
        req,
      })) as unknown as { id: string }

      userID = updatedUser.id
    } else {
      const createdUser = (await payload.create({
        collection: 'users',
        data: {
          accountType: 'b2b',
          b2b: b2bData,
          email,
          name: application.contactName,
          password: crypto.randomBytes(24).toString('hex'),
          roles: ['customer', 'b2b'],
        },
        overrideAccess: true,
        req,
      })) as unknown as { id: string }

      userID = createdUser.id
    }
  } finally {
    req.context.b2bApproval = false
  }

  // Set the reset token inside the same transaction. The email is sent by the
  // afterChange hook so it cannot hold the transaction open.
  const token = await requestBusinessPasswordResetToken({
    email,
    payload,
    req,
  })

  const approvals =
    (req.context.b2bApprovalResetTokens as Record<string, ApprovalTokenEntry> | undefined) || {}

  req.context.b2bApprovalResetTokens = approvals

  approvals[String(application.id)] = {
    email,
    locale: 'de',
    token,
  }

  return {
    ...data,
    user: userID,
  }
}
