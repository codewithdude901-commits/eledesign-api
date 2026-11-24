'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
  locale: 'de' | 'en'
  addressType?: 'billing' | 'shipping'
  buttonText?: string
  modalTitle?: string
}

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading = 'Addresses',
  description = 'Please select or add your shipping and billing addresses.',
  locale,
  addressType,
}) => {
  const { addresses } = useAddresses()

  const buttonText =
    addressType === 'billing'
      ? locale === 'de'
        ? 'Eine neue Rechnungsadresse hinzufügen'
        : 'Add a new billing address'
      : addressType === 'shipping'
        ? locale === 'de'
          ? 'Eine neue Lieferadresse hinzufügen'
          : 'Add a new shipping address'
        : locale === 'de'
          ? 'Eine neue Adresse hinzufügen'
          : 'Add a new address'

  const modalTitle = buttonText

  if (!addresses || addresses.length === 0) {
    return (
      <div>
        {heading ? <h3 className="text-xl font-medium mb-2">{heading}</h3> : null}
        <p>
          {locale === 'de'
            ? 'Keine Adressen gefunden. Bitte fügen Sie eine Adresse hinzu.'
            : 'No addresses found. Please add an address.'}
        </p>

        <CreateAddressModal locale={locale} buttonText={buttonText} modalTitle={modalTitle} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xl font-medium mb-2">{heading}</h3>
        <p className="text-muted-foreground">
          {locale === 'de'
            ? 'Bitte wählen Sie Ihre Liefer- und Rechnungsadressen aus oder fügen Sie diese hinzu.'
            : 'Please select or add your shipping and billing addresses.'}
        </p>
      </div>
      <AddressesModal setAddress={setAddress} locale={locale} buttonText={buttonText} modalTitle={modalTitle} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress, locale, buttonText, modalTitle }) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <p>
        {locale === 'de'
          ? 'Keine Adressen gefunden. Bitte fügen Sie eine Adresse hinzu.'
          : 'No addresses found. Please add an address.'}
      </p>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>
          {locale === 'de' ? 'Wählen Sie eine Adresse aus.' : 'Select an address'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {locale === 'de' ? 'Wählen Sie eine Adresse aus.' : 'Select an address'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-12">
          <ul className="flex flex-col gap-8">
            {addresses.map((address) => (
              <li key={address.id} className="border-b pb-8 last:border-none">
                <AddressItem
                  locale={locale}
                  address={address}
                  hideDefaultActions
                  beforeActions={
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                    >
                      {locale === 'de' ? 'Wählen' : 'Select'}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal locale={locale} buttonText={buttonText} modalTitle={modalTitle} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
