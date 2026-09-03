import React from 'react'

function GardenCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-sm">
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-black/5">
        <div className="h-full w-full animate-pulse bg-black/10" />
      </div>

      {/* Content */}
      <div className="flex grow flex-col justify-between p-4 pb-6">
        <div>
          {/* Title */}
          <div className="h-6 w-3/4 animate-pulse bg-black/10" />

          {/* Description */}
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse bg-black/10" />
            <div className="h-3 w-5/6 animate-pulse bg-black/10" />
            <div className="h-3 w-2/3 animate-pulse bg-black/10" />
          </div>

          {/* Tags */}
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 animate-pulse bg-black/10" />
            <div className="h-7 w-28 animate-pulse bg-black/10" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
          <div className="h-5 w-20 animate-pulse bg-black/10" />
          <div className="h-5 w-16 animate-pulse bg-black/10" />
        </div>
      </div>
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
      <div className="h-11 w-full animate-pulse bg-brand-charcoal/10 sm:w-60" />
      <div className="h-11 w-full animate-pulse bg-brand-charcoal/10 sm:w-60" />
      <div className="h-11 w-full animate-pulse bg-brand-charcoal/10 sm:w-60" />
    </div>
  )
}

export default function Loading() {
  return (
    <main>
      {/* Header */}
      {/* <section className="mb-8">
        <div className="h-10 w-64 animate-pulse bg-brand-charcoal/10" />

        <div className="mt-4 max-w-2xl space-y-2">
          <div className="h-4 w-full animate-pulse bg-brand-charcoal/10" />
          <div className="h-4 w-4/5 animate-pulse bg-brand-charcoal/10" />
        </div>
      </section> */}

      {/* Filters */}
      {/* <div className="mb-8">
        <FilterSkeleton />
      </div> */}

      {/* Garden Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <GardenCardSkeleton key={index} />
        ))}
      </div>
    </main>
  )
}
