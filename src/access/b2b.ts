import type { Access, FieldAccess } from 'payload'

import { checkRole } from '@/access/utilities'

type B2BUserShape = {
  accountType?: 'b2b' | 'b2c' | null
  b2b?: {
    status?: 'approved' | 'pending' | 'suspended' | null
  } | null
}

const asB2BUser = (user: unknown): B2BUserShape | null => {
  if (!user || typeof user !== 'object') return null
  return user as B2BUserShape
}

export const isB2BAccount = (user: unknown): boolean =>
  asB2BUser(user)?.accountType === 'b2b'

export const isApprovedB2BUser = (user: unknown): boolean => {
  const b2bUser = asB2BUser(user)
  return b2bUser?.accountType === 'b2b' && b2bUser?.b2b?.status === 'approved'
}

export const isApprovedB2B: Access = ({ req }) => isApprovedB2BUser(req.user)

export const adminOrApprovedB2B: Access = ({ req }) =>
  checkRole(['admin'], req.user) || isApprovedB2BUser(req.user)

export const adminOrApprovedB2BFieldAccess: FieldAccess = ({ req }) =>
  checkRole(['admin'], req.user) || isApprovedB2BUser(req.user)

export const isCustomer: FieldAccess = ({ req }) =>
  Boolean(req.user && !checkRole(['admin'], req.user))
