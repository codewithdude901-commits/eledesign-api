import type { CollectionAfterChangeHook } from 'payload'

import { sendBusinessPasswordResetEmail } from '@/b2b/emails/sendBusinessPasswordReset'

type ApprovalTokenEntry = {
  email: string
  locale: 'de' | 'en'
  token: null | string
}

export const sendApprovalEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const application = doc as unknown as {
    id: number | string
    status?: null | string
    user?: unknown
  }
  const previous = previousDoc as unknown as { status?: null | string } | undefined

  if (
    application.status !== 'approved' ||
    previous?.status === 'approved' ||
    !application.user
  ) {
    return doc
  }

  const approvals = req.context?.b2bApprovalResetTokens as
    | Record<string, ApprovalTokenEntry>
    | undefined
  const approval = approvals?.[String(application.id)]

  if (!approval?.token) {
    return doc
  }

  try {
    await sendBusinessPasswordResetEmail({
      email: approval.email,
      locale: approval.locale,
      payload: req.payload,
      token: approval.token,
    })
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'Business account approved, but the password reset email could not be sent.',
    })
  }

  return doc
}
