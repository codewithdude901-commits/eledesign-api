export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'Alphabetic A-Z',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'Latest arrivals' },
  { slug: 'priceInEUR', reverse: false, title: 'Price: Low to high' }, // asc
  { slug: '-priceInEUR', reverse: true, title: 'Price: High to low' },
]

export const maintenanceFilters = [
  {
    title: 'All',
    value: '',
  },
  {
    title: 'Low',
    value: 'low',
  },
  {
    title: 'I Love Gardening',
    value: 'high',
  },
]

export const sunlightFilters = [
  {
    title: 'All',
    value: '',
  },
  {
    title: 'Full Sun',
    value: 'full_sun',
  },
  {
    title: 'Partial Sun',
    value: 'partial_sun',
  },
  {
    title: 'Full Shade',
    value: 'shade',
  },
]
