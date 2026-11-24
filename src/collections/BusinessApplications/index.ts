import type { CollectionConfig } from 'payload'
import { checkRole } from '@/access/utilities'
import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { approveApplication } from './hooks/approveApplication'
import { sendApprovalEmail } from './hooks/sendApprovalEmail'

export const BusinessApplications: CollectionConfig = {
  slug: 'business-applications',
  access: {
    create: publicAccess,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Ecommerce',
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'contactName', 'email', 'status', 'createdAt'],
  },
  hooks: {
    afterChange: [sendApprovalEmail],
    beforeChange: [approveApplication],
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation !== 'create' || checkRole(['admin'], req.user)) {
          return data
        }

        return {
          ...data,
          status: 'pending',
        }
      },
    ],
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      required: true,
    },
    {
      name: 'contactName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'vatId',
      type: 'text',
      label: 'VAT ID',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      access: {
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: 'termsAccepted',
      type: 'checkbox',
      required: true,
      access: {
        update: adminOnlyFieldAccess,
      },
      validate: (value) =>
        value === true || 'You must accept the business partner terms to apply.',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      filterOptions: {
        roles: { equals: 'admin' },
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        readOnly: true,
      },
      label: 'Linked user account',
    },
  ],
}
