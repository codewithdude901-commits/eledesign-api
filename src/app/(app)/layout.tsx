import type { ReactNode } from 'react'

import { GoogleTagManager } from '@/components/Analytics/GoogleTagManager'
import { ConsentManager } from '@/components/Consent/ConsentManager'
import { ConditionalFooter } from '@/components/Footer/ConditionalFooter'
import { Navbar } from '@/components/Navbar'
import { Providers } from '@/providers'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.png" rel="icon" sizes="32x32" />
        <link href="/favicon.png" rel="icon" type="image/png" />
      </head>
      <body>
        <ConsentManager />
        <GoogleTagManager />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  )
}
