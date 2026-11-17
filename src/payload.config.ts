import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { resendAdapter } from '@payloadcms/email-resend'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { plugins } from './plugins'

import { AdminNotificationState } from '@/collections/AdminNotificationState'
import { BusinessApplications } from '@/collections/BusinessApplications'
import { Categories } from '@/collections/Categories'
import { Counters } from '@/collections/Counters'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { B2BSettings } from '@/globals/B2BSettings'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      // beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
       afterNavLinks: [
      '@/components/admin/NotificationBadges#NotificationBadges',
    ],
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    Categories,
    Media,
    BusinessApplications,
    Counters,
    AdminNotificationState,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  localization: {
    locales: [
      {
        label: 'German',
        code: 'de',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS!,
    defaultFromName: process.env.EMAIL_FROM_NAME!,
    apiKey: process.env.RESEND_API_KEY!,
  }),
  endpoints: [],
  globals: [HomePage, Header, Footer, B2BSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
