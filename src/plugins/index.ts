import { ecommercePlugin, EUR } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { populateOrderProductNames } from '@/hooks/populateOrderProductNames'
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
        group: 'Content',
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
        group: 'Content',
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
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: defaultCollection.fields.map((field) => {
          if (field.type !== 'tabs') return field

          return {
            ...field,
            tabs: field.tabs.map((tab) => ({
              ...tab,
              fields: tab.fields.map((tabField) => {
                if ('name' in tabField && tabField.name === 'items' && tabField.type === 'array') {
                  return {
                    ...tabField,
                    fields: [
                      {
                        name: 'product_name',
                        type: 'text',
                        label: 'Product Name',
                        admin: {
                          readOnly: true,
                        },
                      },
                      ...tabField.fields,
                    ],
                  }
                }

                return tabField
              }),
            })),
          }
        }),
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            ...(defaultCollection.hooks?.beforeChange ?? []),
            populateOrderProductNames,
          ],
        },
      }),
    },
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          // webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        }),
      ],
    },

    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          fields: [
            ...defaultCollection.fields,
            {
              name: 'in_stock',
              type: 'checkbox',
              label: 'In Stock',
              admin: {
                width: '50%',
                description: 'This field is only necessry for products of type "garden".',
                // condition: (data, siblingData) => siblingData?.product?.product_type === 'garden',
              },
            },
            {
              name: 'total_plant_quantity',
              type: 'number',
              label: 'Total Plant Quantity',
              admin: {
                width: '50%',
                description: 'This field is only necessry for products of type "garden".',
              },
            },
          ],
        }),
      },
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
