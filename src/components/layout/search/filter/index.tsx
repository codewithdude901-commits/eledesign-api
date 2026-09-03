import type { SortFilterItem } from '@/lib/constants'

import { FilterItemDropdown } from './FilterItemDropdown'

export type PathFilterItem = {
  path: string
  title: string
}

export type FilterOption = {
  title: string
  value: string
}

export type ListItem = PathFilterItem | SortFilterItem

type FilterListProps = {
  sorting: SortFilterItem[]
  maintenance: FilterOption[]
  sunlight: FilterOption[]
}

export function FilterList({ sorting, maintenance, sunlight }: FilterListProps) {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-end lg:justify-end">
      <FilterItemDropdown list={maintenance} param="maintenance" title="Maintenance" />

      <FilterItemDropdown list={sunlight} param="sunlight" title="Sunlight" />

      <FilterItemDropdown list={sorting} param="sort" title="Sort by" />
    </div>
  )
}
