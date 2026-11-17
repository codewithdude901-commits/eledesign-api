import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ADMIN_NOTIFICATION_STATE_SLUG = 'admin-notification-state'
export const ADMIN_NOTIFICATION_STATE_KEY = 'global'

export const AdminNotificationState: CollectionConfig = {
  slug: ADMIN_NOTIFICATION_STATE_SLUG,
  access: {
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: false,
    hidden: true,
  },
  hooks: {
    beforeValidate: [
      async ({ operation, req }) => {
        if (operation !== 'create') return
        const existing = await req.payload.find({
          collection: ADMIN_NOTIFICATION_STATE_SLUG,
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        if (existing.totalDocs > 0) {
          throw new APIError('The admin notification state is a singleton document.', 400)
        }
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: ADMIN_NOTIFICATION_STATE_KEY,
      admin: { hidden: true },
    },
    { name: 'ordersLastSeenAt', type: 'date' },
    { name: 'applicationsLastSeenAt', type: 'date' },
  ],
}
