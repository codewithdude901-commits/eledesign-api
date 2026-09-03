'use client'

import React, { useEffect, useState } from 'react'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { AddressItem } from '@/components/addresses/AddressItem'

export const AddressListing: React.FC<{ locale: string }> = ({ locale }) => {
  const { addresses } = useAddresses()

  const [visibleAddresses, setVisibleAddresses] = useState(addresses ?? [])

  // Keep local state synchronized with the ecommerce provider.
  useEffect(() => {
    setVisibleAddresses(addresses ?? [])
  }, [addresses])

  const handleAddressDeleted = (addressID: string) => {
    setVisibleAddresses((current) => current.filter((address) => address.id !== addressID))
  }

  const handleAddressDeleteError = (address: NonNullable<typeof addresses>[number]) => {
    setVisibleAddresses((current) => {
      // Prevent duplicates if the address already exists.
      if (current.some((existingAddress) => existingAddress.id === address.id)) {
        return current
      }

      return [...current, address]
    })
  }

  if (visibleAddresses.length === 0) {
    return <p>{locale === 'de' ? 'Keine Adressen gefunden.' : 'No addresses found.'}</p>
  }

  return (
    <div>
      <ul className="flex flex-col gap-8">
        {visibleAddresses.map((address) => (
          <li key={address.id} className="border-b pb-8 last:border-none">
            <AddressItem
              address={address}
              locale={locale}
              onDeleted={handleAddressDeleted}
              onDeleteError={() => handleAddressDeleteError(address)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
