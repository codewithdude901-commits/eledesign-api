'use client'

import React, { useState } from 'react'
import type { Address } from '@/payload-types'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { deleteAddress } from '@/lib/addresses/deleteAddress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type Props = {
  address: Partial<Omit<Address, 'country'>> & {
    country?: string
  }

  /**
   * Completely override the default actions.
   */
  actions?: React.ReactNode

  /**
   * Insert elements before the default actions.
   */
  beforeActions?: React.ReactNode

  /**
   * Insert elements after the default actions.
   */
  afterActions?: React.ReactNode

  /**
   * Hide all actions.
   */
  hideActions?: boolean

  /**
   * Hide the built-in Edit/Delete actions,
   * while still allowing beforeActions/afterActions.
   *
   * Used by checkout address selection.
   */
  hideDefaultActions?: boolean

  locale: 'de' | 'en'

  /**
   * Called immediately when deletion starts.
   * Used for optimistic UI.
   */
  onDeleted?: (addressID: string) => void

  /**
   * Called if deletion fails.
   * Used to restore the address.
   */
  onDeleteError?: () => void
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  hideDefaultActions = false,
  beforeActions,
  afterActions,
  locale,
  onDeleted,
  onDeleteError,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!address) {
    return null
  }

  const handleDelete = async () => {
    if (!address.id || isDeleting) {
      return
    }

    const addressID = address.id

    setIsDeleting(true)
    setError(null)

    // Optimistically remove the address from the UI.
    onDeleted?.(addressID)

    try {
      await deleteAddress(addressID)

      // Server deletion succeeded.
      setDeleteDialogOpen(false)
      toast.success(
        locale === 'de' ? 'Adresse erfolgreich gelöscht.' : 'Address deleted successfully.',
      )
    } catch (error) {
      console.error('Failed to delete address:', error)

      onDeleteError?.()

      const message =
        locale === 'de'
          ? 'Die Adresse konnte nicht gelöscht werden.'
          : 'Failed to delete the address.'

      setError(message)

      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center">
      <div className="grow">
        <p className="font-medium">
          {address.title && <span>{address.title} </span>}
          {address.firstName} {address.lastName}
        </p>

        <p>{address.company && <span>{address.company} </span>}</p>

        <p>{address.phone && <span>{address.phone}</span>}</p>

        <p>
          {address.addressLine1}
          {address.addressLine2 && <>, {address.addressLine2}</>}
        </p>

        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>

        <p>{address.country}</p>
      </div>

      {!hideActions && address.id && (
        <div className="shrink flex flex-col gap-2">
          {actions ? (
            actions
          ) : hideDefaultActions ? (
            <>
              {beforeActions}
              {afterActions}
            </>
          ) : (
            <>
              {beforeActions}

              <CreateAddressModal
                addressID={address.id}
                initialData={address}
                buttonText={locale === 'de' ? 'Bearbeiten' : 'Edit'}
                modalTitle={locale === 'de' ? 'Adresse bearbeiten' : 'Edit address'}
                locale={locale}
              />

              <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                  if (!isDeleting) {
                    setDeleteDialogOpen(open)
                  }
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => {
                    setError(null)
                    setDeleteDialogOpen(true)
                  }}
                >
                  {locale === 'de' ? 'Löschen' : 'Delete'}
                </Button>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {locale === 'de' ? 'Adresse löschen?' : 'Delete address?'}
                    </DialogTitle>

                    <DialogDescription>
                      {locale === 'de'
                        ? 'Möchten Sie diese Adresse wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
                        : 'Are you sure you want to delete this address? This action cannot be undone.'}
                    </DialogDescription>
                  </DialogHeader>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      {locale === 'de' ? 'Abbrechen' : 'Cancel'}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting
                        ? locale === 'de'
                          ? 'Löschen...'
                          : 'Deleting...'
                        : locale === 'de'
                          ? 'Löschen'
                          : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  )
}
