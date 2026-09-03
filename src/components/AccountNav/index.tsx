'use client'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()
  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Button
            asChild
            variant="link"
            className={clsx('text-primary/70 hover:text-primary hover:no-underline', {
              'text-primary': pathname === `/${locale}/account` || pathname === '/account',
            })}
          >
            <Link href={`/${locale}/account`}>
              {locale === 'de' ? 'Kontoeinstellungen' : 'Account settings'}
            </Link>
          </Button>
        </li>

        <li>
          <Button
            asChild
            variant="link"
            className={clsx('text-primary/80 hover:text-primary hover:no-underline', {
              'text-primary':
                pathname === `/${locale}/account/addresses` ||
                pathname.includes('/account/addresses'),
            })}
          >
            <Link href={`/${locale}/account/addresses`}>
              {locale === 'de' ? 'Adressen' : 'Addresses'}
            </Link>
          </Button>
        </li>

        <li>
          <Button
            asChild
            variant="link"
            className={clsx('text-primary/70 hover:text-primary hover:no-underline', {
              'text-primary': pathname === `/${locale}/account/orders` || pathname === '/orders',
            })}
          >
            <Link href={`/${locale}/orders`}>{locale === 'de' ? 'Bestellungen' : 'Orders'}</Link>
          </Button>
        </li>
      </ul>

      <hr className="w-full border-white/5" />

      <Button
        asChild
        variant="link"
        className={clsx('text-primary/70 hover:text-primary hover:no-underline', {
          'text-primary': pathname === '/logout',
        })}
      >
        <Link href={`/${locale}/logout`}>{locale === 'de' ? 'Abmelden' : 'Log out'} </Link>
      </Button>
    </div>
  )
}
