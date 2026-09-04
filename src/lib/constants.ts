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

export const styleFilters = [
  {
    title: 'All Styles',
    value: '',
  },
  {
    title: 'Hot & Rocky',
    value: 'hot-rocky',
  },
  {
    title: 'Mediterranean & Fragrant',
    value: 'mediterranean-fragrant',
  },
  {
    title: 'Romantic & Delicate',
    value: 'romantic-delicate',
  },
  {
    title: 'Elegant & Bright',
    value: 'elegant-bright',
  },
  {
    title: 'Elegant & Dark',
    value: 'elegant-dark',
  },
  {
    title: 'Green & Easy-Care',
    value: 'green-easy',
  },
  {
    title: 'Fiery & Lively',
    value: 'fiery-lively',
  },
  {
    title: 'Wild & Tall',
    value: 'wild-tall',
  },
  {
    title: 'Bright & Warm',
    value: 'bright-warm',
  },
  {
    title: 'Romantic & Shaded',
    value: 'romantic-shaded',
  },
  {
    title: 'Bold & Elegant',
    value: 'bold-elegant',
  },
  {
    title: 'Natural & Woodland',
    value: 'natural-woodland',
  },
]