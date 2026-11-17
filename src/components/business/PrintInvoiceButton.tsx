'use client'

import React from 'react'

import { Button } from '@/components/ui/button'

export const PrintInvoiceButton: React.FC<{ label: string }> = ({ label }) => (
  <Button className="no-print" onClick={() => window.print()} type="button">
    {label}
  </Button>
)
