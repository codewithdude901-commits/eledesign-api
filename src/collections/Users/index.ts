import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { enforceLoginPortal } from './hooks/enforceLoginPortal'
import { guardB2BUserCreate } from './hooks/guardB2BUserCreate'

const selfOrAdminUpdate = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf,
  },
  admin: {
    group: 'Users',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 1209600,
  },
  hooks: {
    beforeChange: [guardB2BUserCreate],
    beforeLogin: [enforceLoginPortal],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'accountType',
      type: 'select',
      index: true,
      defaultValue: 'b2c',
      access: {
        create: adminOnlyFieldAccess,
        read: () => true,
        update: adminOnlyFieldAccess,
      },
      options: [
        { label: 'B2C customer', value: 'b2c' },
        { label: 'B2B business partner', value: 'b2b' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'b2b',
      type: 'group',
      admin: {
        condition: (data) => data?.accountType === 'b2b',
      },
      fields: [
        {
          name: 'companyName',
          type: 'text',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
        },
        {
          name: 'vatId',
          type: 'text',
          label: 'VAT ID',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
        },
        {
          name: 'contactPhone',
          type: 'text',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: selfOrAdminUpdate,
          },
        },
        {
          name: 'invoiceEmail',
          type: 'email',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: selfOrAdminUpdate,
          },
        },
        {
          name: 'website',
          type: 'text',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: selfOrAdminUpdate,
          },
        },
        {
          name: 'preferredLocale',
          type: 'select',
          defaultValue: 'de',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: selfOrAdminUpdate,
          },
          options: [
            { label: 'German', value: 'de' },
            { label: 'English', value: 'en' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          index: true,
          defaultValue: 'pending',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Suspended', value: 'suspended' },
          ],
        },
        {
          name: 'discountPercent',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
          admin: {
            description: 'Discount applied to B2B prices. 0 means the listed B2B price is used.',
          },
        },
        {
          name: 'approvedAt',
          type: 'date',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users',
          access: {
            create: adminOnlyFieldAccess,
            read: () => true,
            update: adminOnlyFieldAccess,
          },
        },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'customer',
          value: 'customer',
        },
        {
          label: 'b2b',
          value: 'b2b',
        },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      on: 'customer',
      defaultLimit: 1,
      defaultSort: '-createdAt',
      where: {
        purchasedAt: {
          equals: null,
        },
      },
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
  ],
}
