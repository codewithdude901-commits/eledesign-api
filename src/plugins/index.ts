import { ecommercePlugin, EUR } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { APIError, Plugin } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { isB2BAccount, isCustomer } from '@/access/b2b'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { invoiceAdapter } from '@/b2b/payments/invoiceAdapter'
import {
  b2bCartsCollectionOverride,
  b2bOrdersCollectionOverride,
  b2bTransactionsCollectionOverride,
  b2bVariantsCollectionOverride,
} from '@/b2b/pluginOverrides'
import { ProductsCollection } from '@/collections/Products'
import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord | null => {
  if (typeof value !== 'object' || value === null) return null
  return value as UnknownRecord
}

const formatOrderDate = (value: unknown): string => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin',
  }).format(date)
}

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} ` : 'Eledesign Ecommerce Store'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const stripePaymentAdapter = stripeAdapter({
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  // webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
})

const guardedStripeAdapter: PaymentAdapter = {
  ...stripePaymentAdapter,
  confirmOrder: async (args) => {
    if (isB2BAccount(args.req.user)) {
      throw new APIError('Business orders must be paid by invoice.', 403)
    }

    return stripePaymentAdapter.confirmOrder(args)
  },
  initiatePayment: async (args) => {
    if (isB2BAccount(args.req.user)) {
      throw new APIError('Business orders must be paid by invoice.', 403)
    }

    return stripePaymentAdapter.initiatePayment(args)
  },
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: false,
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: false,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isCustomer,
      isDocumentOwner,
    },
    carts: {
      cartsCollectionOverride: b2bCartsCollectionOverride,
      
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: b2bOrdersCollectionOverride,
    },
    payments: {
      paymentMethods: [guardedStripeAdapter, invoiceAdapter()],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: b2bVariantsCollectionOverride,
      },
    },
    transactions: {
      transactionsCollectionOverride: b2bTransactionsCollectionOverride,
    },
    currencies: {
      supportedCurrencies: [EUR],
      defaultCurrency: 'EUR',
    },
  }),
  s3Storage({
    enabled: Boolean(process.env.R2_BUCKET),
    collections: {
      media: {
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix }) => {
          const key = prefix ? `${prefix}/${filename}` : filename
          return `${process.env.R2_PUBLIC_URL}/${key}`
        },
      },
    },
    bucket: process.env.R2_BUCKET!,
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      region: 'auto',
      // R2 S3 API endpoint — for uploads only, not for serving files
      endpoint: process.env.R2_ENDPOINT,
      forcePathStyle: true,
    },
  }),
  importExportPlugin({
    collections: [
      {
        slug: 'orders',

        export: {
          format: 'csv',
          disableJobsQueue: true,

          hooks: {
            before: ({ data, originalData }) => {
              return data.map((_, index) => {
                const order = asRecord(originalData[index]) ?? {}

                const items = Array.isArray(order.items) ? order.items : []

                const products: string[] = []
                const variants: string[] = []
                const quantities: string[] = []

                for (const item of items) {
                  const product = asRecord(item)

                  if (!product) continue

                  const productName =
                    typeof product.product_name === 'string'
                      ? product.product_name
                      : 'Unknown product'

                  const variant = asRecord(product.variant)

                  const variantName = typeof variant?.title === 'string' ? variant.title : ''

                  const quantity = Number(product.quantity) || 1

                  products.push(productName)
                  variants.push(variantName)
                  quantities.push(String(quantity))
                }

                const customer = asRecord(order.customer)
                const shipping = asRecord(order.shippingAddress)

                return {
                  orderId: String(order.id ?? ''),

                  orderDate: formatOrderDate(order.createdAt),

                  customerEmail: String(order.customerEmail ?? '') || String(customer?.email ?? ''),

                  products: products.join('; '),
                  variants: variants.join('; '),
                  quantities: quantities.join('; '),

                  orderTotal:
                    typeof order.amount === 'number' ? (order.amount / 100).toFixed(2) : '',
                  currency: String(order.currency ?? ''),

                  title: String(shipping?.title ?? ''),
                  firstName: String(shipping?.firstName ?? ''),
                  lastName: String(shipping?.lastName ?? ''),
                  company: String(shipping?.company ?? ''),
                  addressLine1: String(shipping?.addressLine1 ?? ''),
                  addressLine2: String(shipping?.addressLine2 ?? ''),
                  city: String(shipping?.city ?? ''),
                  state: String(shipping?.state ?? ''),
                  postalCode: String(shipping?.postalCode ?? ''),
                  country: String(shipping?.country ?? ''),
                  phone: shipping?.phone ? `${String(shipping.phone)}` : '',

                  status: String(order.status ?? ''),

                  channel: String(order.channel ?? 'b2c'),
                  b2bStatus: String(order.b2bStatus ?? ''),
                  companyName: String(asRecord(order.companySnapshot)?.companyName ?? ''),
                  vatId: String(asRecord(order.companySnapshot)?.vatId ?? ''),
                  invoiceNumber: String(asRecord(order.invoice)?.invoiceNumber ?? ''),
                  invoiceDueDate: formatOrderDate(asRecord(order.invoice)?.dueDate),
                  invoicePaidAt: formatOrderDate(asRecord(order.invoice)?.paidAt),
                  purchaseOrderNumber: String(order.purchaseOrderNumber ?? ''),
                }
              })
            },
          },
        },

        import: false,
      },
    ],
  }),
]
