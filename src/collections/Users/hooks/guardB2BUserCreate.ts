import type { CollectionBeforeChangeHook } from 'payload'

import { checkRole } from '@/access/utilities'

type B2BData = {
  accountType?: 'b2b' | 'b2c' | null
  b2b?: {
    status?: 'approved' | 'pending' | 'suspended' | null
  } | null
  roles?: string[] | null
}

/**
 * Public registration must never be able to create an approved B2B account.
 * Business accounts are created by the application approval hook or by an admin.
 */
export const guardB2BUserCreate: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const b2bData = data as B2BData

  if (b2bData.accountType !== 'b2b') return data

  if (req.context?.b2bApproval === true) return data

  if (checkRole(['admin'], req.user)) return data

  return {
    ...data,
    b2b: {
      ...(b2bData.b2b || {}),
      status: 'pending',
    },
    roles: ['customer'],
  }
}
