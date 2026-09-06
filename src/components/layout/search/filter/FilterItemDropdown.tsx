'use client'

import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { SortFilterItem } from '@/lib/constants'
import type { FilterOption } from '.'

type Props = {
  list: SortFilterItem[] | FilterOption[]
  title: string
  param: string
  locale: 'de' | 'en'
}

export function FilterItemDropdown({ list, title, param, locale }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentValue = searchParams.get(param) ?? ''

  const activeItem =
    list.find((item) => {
      if ('slug' in item) {
        return (item.slug ?? '') === currentValue
      }

      return item.value === currentValue
    }) ?? list[0]

  const activeTitle = activeItem?.title ?? title

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname, searchParams])

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(param, value)
    } else {
      params.delete(param)
    }

    const queryString = params.toString()

    router.push(queryString ? `${pathname}?${queryString}` : pathname)

    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="
          flex h-11 w-full min-w-60
          items-center justify-between gap-6
          border border-brand-charcoal/15
          bg-white px-4
          text-sm text-brand-charcoal
          transition
          hover:border-brand-charcoal/30
          focus:outline-none
          focus:ring-1
          focus:ring-gray-400
         
        "
      >
        <span className="flex items-center gap-2">
          <span className="text-brand-charcoal/50">{title}:</span>

          <span className="font-medium">{locale === 'de' ? activeTitle.de : activeTitle.en}</span>
        </span>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="
            absolute right-0 top-full z-50 mt-2
            min-w-full overflow-hidden
            border border-brand-charcoal/10
            bg-white p-1
            shadow-xl
          "
        >
          {list.map((item, index) => {
            const value = 'slug' in item ? (item.slug ?? '') : item.value

            const isActive = value === currentValue

            return (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => handleSelect(value)}
                className={`
                  block w-full px-3 py-2.5
                  text-left text-sm
                  transition-colors
                  ${
                    isActive
                      ? 'bg-brand-charcoal/5 font-semibold text-brand-charcoal'
                      : 'text-brand-charcoal hover:bg-brand-charcoal/5'
                  }
                `}
              >
                {locale === 'de' ? item.title.de : item.title.en}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
