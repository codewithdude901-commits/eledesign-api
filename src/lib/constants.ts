export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: { de: string; en: string }
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,

  title: { de: 'Alphabetisch A–Z', en: 'Alphabetic A-Z' },
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    slug: '-createdAt',
    reverse: true,

    title: { de: 'Neuheiten', en: 'Latest arrivals' },
  },
  {
    slug: 'priceInEUR',
    reverse: false,

    title: { de: 'Niedrig bis hoch', en: 'Low to high' },
  }, // asc
  {
    slug: '-priceInEUR',
    reverse: true,

    title: { de: 'Von hoch nach niedrig', en: 'High to low' },
  },
]

export const maintenanceFilters = [
  {
    title: { de: 'Alle', en: 'All' },
    value: '',
  },
  {
    title: { de: 'Niedrig', en: 'Low' },
    value: 'low',
  },
  {
    title: { de: 'Ich liebe die Gartenarbeit.', en: 'I Love Gardening' },
    value: 'high',
  },
]

export const sunlightFilters = [
  {
    title: { de: 'Alle', en: 'All' },
    value: '',
  },
  {
    title: { de: 'Volle Sonne', en: 'Full sun' },
    value: 'full_sun',
  },
  {
    title: { de: 'Halbschatten', en: 'Partial Sun' },
    value: 'partial_sun',
  },
  {
    title: { de: 'Vollschatten', en: 'Full Shade' },
    value: 'shade',
  },
]

export const styleFilters = [
  {
    title: { de: 'Alle', en: 'All' },
    value: '',
  },
  {
    title: { de: 'Heiß & Steinig', en: 'Hot & Rocky' },
    value: 'hot-rocky',
  },
  {
    title: { de: 'Mediterran & Duftend', en: 'Mediterranean & Fragrant' },
    value: 'mediterranean-fragrant',
  },
  {
    title: { de: 'Romantisch & Zart', en: 'Romantic & Delicate' },
    value: 'romantic-delicate',
  },
  {
    title: { de: 'Elegant & weiß', en: 'Elegant & Bright' },
    value: 'elegant-bright',
  },
  {
    title: { de: 'Elegant & Dunkel', en: 'Elegant & Dark' },
    value: 'elegant-dark',
  },
  {
    title: { de: 'Grün & Pflegeleicht', en: 'Green & Easy-Care' },
    value: 'green-easy',
  },
  {
    title: { de: 'Feurig & Lebendig', en: 'Fiery & Lively' },
    value: 'fiery-lively',
  },
  {
    title: { de: 'Wild & Hoch', en: 'Wild & Tall' },
    value: 'wild-tall',
  },
  {
    title: { de: 'Leuchtend & Warm', en: 'Bright & Warm' },
    value: 'bright-warm',
  },
  {
    title: { de: 'Romantisch & Schattig', en: 'Romantic & Shaded' },
    value: 'romantic-shaded',
  },
  {
    title: { de: 'Blattstark & Elegant', en: 'Bold & Elegant' },
    value: 'bold-elegant',
  },
  {
    title: { de: 'Natürlich & Waldig', en: 'Natural & Woodland' },
    value: 'natural-woodland',
  },
]
