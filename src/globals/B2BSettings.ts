import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const B2BSettings: GlobalConfig = {
  slug: 'b2b-settings',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Ecommerce',
    
  },
  fields: [
    {
      name: 'bankAccountHolder',
      type: 'text',
    },
    {
      name: 'bankName',
      type: 'text',
    },
    {
      name: 'iban',
      type: 'text',
      label: 'IBAN',
    },
    {
      name: 'bic',
      type: 'text',
      label: 'BIC',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'invoiceDueDays',
          type: 'number',
          defaultValue: 14,
          min: 0,
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'vatRatePercent',
          type: 'number',
          defaultValue: 19,
          min: 0,
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'invoiceNumberPrefix',
          type: 'text',
          defaultValue: 'INV',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'minimumOrderValue',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Minimum B2B net order value in cents. Set to 0 to disable.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'orderNotificationEmail',
      type: 'email',
      admin: {
        description: 'Receives a notification when a business partner places an order.',
      },
    },
    {
      name: 'invoiceFooterText',
      type: 'textarea',
    },
    {
      name: 'termsUrl',
      type: 'text',
      admin: {
        description: 'Link to the business partner terms shown during checkout.',
      },
    },
  ],
}
