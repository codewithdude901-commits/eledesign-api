import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * Internal atomic counters, currently used for B2B invoice numbering.
 */
export const Counters: CollectionConfig = {
  slug: 'counters',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'B2B',
    hidden: true,
    useAsTitle: 'key',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'value',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
  ],
}
