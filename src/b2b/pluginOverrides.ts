import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrApprovedB2BFieldAccess } from '@/access/b2b'
import {
  cartItemB2BFields,
  injectArrayFields,
  orderItemPriceFields,
  transactionItemPriceFields,
} from '@/b2b/collections/fieldHelpers'
import { setB2BOrderStatus, syncB2BOrderAfterChange } from '@/b2b/hooks/orderHooks'
import { setB2BCartPricing } from '@/b2b/hooks/setB2BCartPricing'
import { populateOrderProductNames } from '@/hooks/populateOrderProductNames'
import { sendB2COrderConfirmationAfterChange } from '@/b2c/hooks/orderHooks'

const productNameField: Field = {
  name: 'product_name',
  type: 'text',
  label: 'Product Name',
  admin: {
    readOnly: true,
  },
}

const addressFields: Field[] = [
  { name: 'title', type: 'text' },
  { name: 'firstName', type: 'text' },
  { name: 'lastName', type: 'text' },
  { name: 'company', type: 'text' },
  { name: 'addressLine1', type: 'text' },
  { name: 'addressLine2', type: 'text' },
  { name: 'city', type: 'text' },
  { name: 'state', type: 'text' },
  { name: 'postalCode', type: 'text' },
  { name: 'country', type: 'text' },
  { name: 'phone', type: 'text' },
]

const invoiceFields: Field[] = [
  {
    name: 'invoiceNumber',
    type: 'text',
    index: true,
    label: 'Invoice number',
  },
  {
    name: 'dueDate',
    type: 'date',
    label: 'Due date',
  },
  {
    name: 'netAmount',
    type: 'number',
    label: 'Net amount (cents)',
  },
  {
    name: 'vatRate',
    type: 'number',
    label: 'VAT rate (%)',
  },
  {
    name: 'vatAmount',
    type: 'number',
    label: 'VAT amount (cents)',
  },
  {
    name: 'grossAmount',
    type: 'number',
    label: 'Gross amount (cents)',
  },
  { name: 'bankAccountHolder', type: 'text' },
  { name: 'bankName', type: 'text' },
  { name: 'iban', type: 'text', label: 'IBAN' },
  { name: 'bic', type: 'text', label: 'BIC' },
  { name: 'paymentReference', type: 'text' },
  {
    name: 'paidAt',
    type: 'date',
    access: {
      create: adminOnlyFieldAccess,
      read: () => true,
      update: adminOnlyFieldAccess,
    },
    label: 'Paid at',
  },
  {
    name: 'paidBy',
    type: 'relationship',
    relationTo: 'users',
    access: {
      create: adminOnlyFieldAccess,
      read: () => true,
      update: adminOnlyFieldAccess,
    },
    admin: {
      readOnly: true,
    },
    label: 'Paid by',
  },
  {
    name: 'settlementNotes',
    type: 'textarea',
    access: {
      create: adminOnlyFieldAccess,
      read: () => true,
      update: adminOnlyFieldAccess,
    },
    label: 'Settlement notes',
  },
  {
    name: 'footerText',
    type: 'textarea',
    label: 'Invoice footer',
  },
]

const b2bOnlyFieldAccess = {
  create: adminOnlyFieldAccess,
  read: () => true,
  update: adminOnlyFieldAccess,
}

export const b2bCartsCollectionOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    group: false,
  },
  fields: [
    ...injectArrayFields(defaultCollection.fields, 'items', cartItemB2BFields),
    {
      name: 'channel',
      type: 'select',
      index: true,
      defaultValue: 'b2c',
      access: {
        create: () => false,
        read: () => true,
        update: () => false,
      },
      options: [
        { label: 'B2C', value: 'b2c' },
        { label: 'B2B', value: 'b2b' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [setB2BCartPricing],
  },
})

export const b2bOrdersCollectionOverride: CollectionOverride = ({ defaultCollection }) => {
  // console.log(
  //   '[Orders Default Fields]',
  //   defaultCollection.fields
  //     .filter((field) => 'name' in field)
  //     .map((field) => field.name),
  // )
  const baseFields = defaultCollection.fields.map((field) => {
    if (field.type === 'select' && field.name === 'status') {
      return {
        ...field,
        admin: {
          ...field.admin,
          condition: (data: Record<string, unknown>) => data?.channel !== 'b2b',
        },
      }
    }

    return field
  })

  return {
    ...defaultCollection,
    admin: {
      ...defaultCollection.admin,
      defaultColumns: ['createdAt', 'customer', 'channel', 'b2bStatus', 'amount', 'status'],
    },
    fields: [
      ...injectArrayFields(baseFields, 'items', [productNameField, ...orderItemPriceFields]),
      {
        name: 'channel',
        type: 'select',
        index: true,
        defaultValue: 'b2c',
        access: b2bOnlyFieldAccess,
        options: [
          { label: 'B2C', value: 'b2c' },
          { label: 'B2B', value: 'b2b' },
        ],
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'b2bStatus',
        type: 'select',
        index: true,
        access: b2bOnlyFieldAccess,
        options: [
          { label: 'Awaiting payment', value: 'awaiting_payment' },
          { label: 'Paid', value: 'paid' },
          { label: 'Processing', value: 'processing' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
        label: 'Business order status',
        admin: {
          condition: (data) => data?.channel === 'b2b',
          description:
            'Shown in the partner dashboard. The internal order status is synchronized for completed and cancelled orders.',
          position: 'sidebar',
        },
      },
      {
        name: 'billingAddress',
        type: 'group',
        admin: {
          condition: (data) => data?.channel === 'b2b',
        },
        fields: addressFields,
        label: 'Billing address',
      },
      {
        name: 'companySnapshot',
        type: 'group',
        admin: {
          condition: (data) => data?.channel === 'b2b',
        },
        fields: [
          { name: 'companyName', type: 'text' },
          { name: 'vatId', type: 'text', label: 'VAT ID' },
          { name: 'contactName', type: 'text' },
          { name: 'email', type: 'email' },
          { name: 'phone', type: 'text' },
          {
            name: 'preferredLocale',
            type: 'select',
            defaultValue: 'de',
            options: [
              { label: 'German', value: 'de' },
              { label: 'English', value: 'en' },
            ],
          },
        ],
        label: 'Company snapshot',
      },
      {
        name: 'purchaseOrderNumber',
        type: 'text',
        admin: {
          condition: (data) => data?.channel === 'b2b',
        },
        label: 'Purchase order number',
      },
      {
        name: 'customerNotes',
        type: 'textarea',
        admin: {
          condition: (data) => data?.channel === 'b2b',
        },
        label: 'Customer notes',
      },
      {
        name: 'invoice',
        type: 'group',
        admin: {
          condition: (data) => data?.channel === 'b2b',
        },
        fields: invoiceFields,
        label: 'Invoice',
      },
      {
        name: 'inventoryRestored',
        type: 'checkbox',
        access: {
          create: () => false,
          read: () => true,
          update: () => false,
        },
        admin: {
          hidden: true,
          readOnly: true,
        },
      },
      {
        name: 'accessToken',
        type: 'text',
        unique: true,
        index: true,
        admin: {
          position: 'sidebar',
          readOnly: true,
        },
        hooks: {
          beforeValidate: [
            ({ value, operation }) => {
              if (operation === 'create' || !value) {
                return crypto.randomUUID()
              }

              return value
            },
          ],
        },
      },
    ],
    hooks: {
      ...defaultCollection.hooks,
      afterChange: [syncB2BOrderAfterChange, sendB2COrderConfirmationAfterChange],
      beforeChange: [
        ...(defaultCollection.hooks?.beforeChange || []),
        populateOrderProductNames,
        setB2BOrderStatus,
      ],
    },
  }
}

export const b2bTransactionsCollectionOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...injectArrayFields(defaultCollection.fields, 'items', transactionItemPriceFields),
    {
      name: 'shippingAddress',
      type: 'group',
      fields: addressFields,
      label: 'Shipping address',
    },
  ],
})

export const b2bVariantsCollectionOverride: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...defaultCollection.fields,
    {
      name: 'in_stock',
      type: 'checkbox',
      label: 'In Stock',
      admin: {
        width: '50%',
        description: 'This field is only necessary for products of type "garden".',
      },
    },
    {
      name: 'total_plant_quantity',
      type: 'number',
      label: 'Total Plant Quantity',
      admin: {
        width: '50%',
        description: 'This field is only necessary for products of type "garden".',
      },
    },
    {
      name: 'b2bPriceInEUR',
      type: 'number',
      min: 0,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOrApprovedB2BFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        description:
          'Net B2B price in cents, excl. VAT. Overrides the product B2B price for this variant.',
      },
      label: 'B2B Price (EUR, net)',
    },
    {
      name: 'b2bMinOrderQuantity',
      type: 'number',
      min: 1,
      access: {
        create: adminOnlyFieldAccess,
        read: () => true,
        update: adminOnlyFieldAccess,
      },
      admin: {
        description:
          'Optional variant override. Leave empty to inherit the product-level B2B minimum order quantity.',
      },
      label: 'B2B Minimum Order Quantity',
    },
  ],
})
