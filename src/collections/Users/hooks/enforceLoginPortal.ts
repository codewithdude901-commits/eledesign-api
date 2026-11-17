import type { CollectionBeforeLoginHook } from 'payload'
import { APIError } from 'payload'

import { isApprovedB2BUser } from '@/access/b2b'

type PortalAwareUser = {
  accountType?: 'b2b' | 'b2c' | null
  b2b?: {
    status?: 'approved' | 'pending' | 'suspended' | null
  } | null
}

export const enforceLoginPortal: CollectionBeforeLoginHook = ({ req, user }) => {
  const portal =
    req.data?.portal === 'business' || req.headers?.get('x-b2b-portal') === 'true'
      ? 'business'
      : 'b2c'
  const portalUser = user as unknown as PortalAwareUser
  const isB2B = portalUser?.accountType === 'b2b'
  const requestPath = req.pathname || req.url || ''
  const isResetPasswordRequest = requestPath.includes('/reset-password')

  // Payload runs beforeLogin hooks after a successful password reset too.
  // A valid reset token already proves account ownership; do not turn the
  // reset request into a B2C-login rejection for a business account.
  if (isB2B && isResetPasswordRequest) {
    return user
  }

  if (portal === 'business') {
    if (!isApprovedB2BUser(portalUser)) {
      throw new APIError(
        'This account is not approved for the business portal. Please contact us if you need access.',
        403,
      )
    }

    return user
  }

  if (isB2B) {
    throw new APIError('This is a business account. Please use the business login portal.', 403)
  }

  return user
}
