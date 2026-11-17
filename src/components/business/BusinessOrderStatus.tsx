import React from 'react'

import { cn } from '@/utilities/cn'

type Status = 'awaiting_payment' | 'cancelled' | 'completed' | 'paid' | 'processing' | 'shipped'

type Props = {
  locale: 'de' | 'en'
  status?: null | string
}

const labels: Record<Status, { de: string; en: string }> = {
  awaiting_payment: { de: 'Zahlung ausstehend', en: 'Awaiting payment' },
  cancelled: { de: 'Storniert', en: 'Cancelled' },
  completed: { de: 'Abgeschlossen', en: 'Completed' },
  paid: { de: 'Bezahlt', en: 'Paid' },
  processing: { de: 'In Bearbeitung', en: 'Processing' },
  shipped: { de: 'Versandt', en: 'Shipped' },
}

const classes: Record<Status, string> = {
  awaiting_payment: 'border-amber-300 bg-amber-50 text-amber-900',
  cancelled: 'border-red-300 bg-red-50 text-red-800',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  paid: 'border-blue-300 bg-blue-50 text-blue-900',
  processing: 'border-stone-300 bg-stone-100 text-stone-800',
  shipped: 'border-indigo-300 bg-indigo-50 text-indigo-900',
}

export const BusinessOrderStatus: React.FC<Props> = ({ locale, status }) => {
  const key = (status || 'processing') as Status
  const label = labels[key]?.[locale] || status || '-'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border px-2.5 py-1 text-xs font-medium',
        classes[key] || classes.processing,
      )}
    >
      {label}
    </span>
  )
}
