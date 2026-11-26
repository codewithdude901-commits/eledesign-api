'use client'

import React from 'react'

type OrderDoc = {
  readAt?: string | null
  id: string | number
}

type CellProps = {
  field: { name: string }
  rowData: OrderDoc
  cellData?: string | null
  collectionSlug?: string
  columnIndex?: number
  link?: boolean
  linkURL?: string
  className?: string
}

export const ReadStatusCell = ({ cellData, rowData, field }: CellProps) => {
  // Only render for readAt field
  if (field?.name !== 'readAt') {
    return <>{cellData}</>
  }

  const isRead = Boolean(cellData ?? rowData.readAt)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
      }}
      title={isRead ? 'Read' : 'Unread'}
    >
      {isRead ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#10b981' }}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ) : (
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}
    </div>
  )
}