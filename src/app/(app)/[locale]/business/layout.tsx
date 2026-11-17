import React from 'react'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[70vh] bg-stone-50">{children}</div>
}
