'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MenuProps {
  name: string
  href: string
}

interface MobileMenuProps {
  menu: MenuProps[]
  locale?: 'de' | 'en'
}

export function MobileMenu({ menu, locale }: MobileMenuProps) {
  const { user } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const closeMobileMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center  text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-5" />
      </SheetTrigger>

      <SheetContent side="right" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>Eledesign</SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          <h2 className="text-xl mb-4">{locale === 'de' ? 'Erkunden' : 'Explore'}</h2>
          <hr className="my-2" />
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2 " key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">{locale === 'de' ? 'Mein Konto' : 'My account'}</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={`/${locale}/orders`}>
                  {locale === 'de' ? 'Bestellungen' : 'Orders'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account/addresses`}>
                  {locale === 'de' ? 'Adressen' : 'Addresses'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account`}>
                  {locale === 'de' ? 'Konto verwalten' : 'Manage account'}
                </Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href={`/${locale}/logout`}>{locale === 'de' ? 'Abmelden' : 'Log out'}</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">{locale === 'de' ? 'Mein Konto' : 'My account'}</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href={`/${locale}/login`}>{locale === 'de' ? 'Anmelden' : 'Log in'}</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">or</span>
              <Button asChild className="w-full sm:flex-1">
                <Link href={`/${locale}/create-account`}>
                  {locale === 'de' ? 'Konto erstellen' : 'Create an account'}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
