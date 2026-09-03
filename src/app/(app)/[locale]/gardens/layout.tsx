import { maintenanceFilters, sunlightFilters, sorting } from '@/lib/constants'

import { FilterList } from '@/components/layout/search/filter'
import { Search } from '@/components/Search'

import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className=" my-16 pb-4 max-w-7xl mx-auto px-4 sm:px-6 ">
        <Search className="mb-6" />

        <div className="mb-8 flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl lg:hidden">
            Gardens
          </h1>

          <div className="border-b border-brand-charcoal/10 py-4 flex">
            <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl hidden lg:block">
              Gardens
            </h1>
            <FilterList
              sorting={sorting}
              maintenance={maintenanceFilters}
              sunlight={sunlightFilters}
            />
          </div>
        </div>

        <div className="min-h-screen w-full">{children}</div>
      </div>
    </Suspense>
  )
}
