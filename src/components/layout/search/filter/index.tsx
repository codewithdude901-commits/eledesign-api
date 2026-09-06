import type { SortFilterItem } from '@/lib/constants'

import { FilterItemDropdown } from './FilterItemDropdown'

export type PathFilterItem = {
  path: string
  title: string
}

export type FilterOption = {
  title: { de: string; en: string }
  value: string
}

export type ListItem = PathFilterItem | SortFilterItem

type FilterListProps = {
  sorting: SortFilterItem[]
  maintenance: FilterOption[]
  sunlight: FilterOption[]
  style: FilterOption[]
  locale: 'de' | 'en'
}

export function FilterList({ sorting, maintenance, sunlight, style, locale }: FilterListProps) {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-end lg:justify-end">
      <FilterItemDropdown
        list={maintenance}
        param="maintenance"
        title={locale === 'de' ? 'Pflegebedarf' : 'Maintenance'}
        locale={locale}
      />

      <FilterItemDropdown
        list={sunlight}
        param="sunlight"
        title={locale === 'de' ? 'Sonnenlicht' : 'Sunlight'}
        locale={locale}
      />
      <FilterItemDropdown
        list={style}
        param="style"
        title={locale === 'de' ? 'Gartenstil' : 'Garden Style'}
        locale={locale}
      />

      {/* <FilterItemDropdown list={sorting} param="sort" title="Sort by" /> */}
    </div>
  )
}
