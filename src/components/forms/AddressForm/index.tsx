'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Address, Config } from '@/payload-types'
import {
  defaultCountries as supportedCountries,
  useAddresses,
} from '@payloadcms/plugin-ecommerce/client/react'
import { deepMergeSimple } from 'payload/shared'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'next/navigation'

import { titles } from './constants'

type AddressFormValues = {
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & {
    country?: string
  }
  callback?: (data: Partial<Address>) => void
  /**
   * If true, the form will not submit to the API.
   */
  skipSubmission?: boolean
}

export const AddressForm: React.FC<Props> = ({
  addressID,
  initialData,
  callback,
  skipSubmission,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressFormValues>({
    defaultValues: initialData,
  })

  const { createAddress, updateAddress } = useAddresses()

  const params = useParams<{ locale: 'de' | 'en' }>()
  const locale = params.locale || 'de'

  const t =
    locale === 'de'
      ? {
          title: 'Anrede',
          firstName: 'Vorname',
          lastName: 'Nachname',
          phone: 'Telefon',
          company: 'Unternehmen',
          addressLine1: 'Adresszeile 1',
          addressLine2: 'Adresszeile 2',
          city: 'Stadt',
          state: 'Bundesland',
          postalCode: 'Postleitzahl',
          country: 'Land',
          submit: 'Speichern',

          firstNameRequired: 'Vorname ist erforderlich.',
          lastNameRequired: 'Nachname ist erforderlich.',
          addressLine1Required: 'Adresszeile 1 ist erforderlich.',
          cityRequired: 'Stadt ist erforderlich.',
          postalCodeRequired: 'Postleitzahl ist erforderlich.',
          countryRequired: 'Land ist erforderlich.',
        }
      : {
          title: 'Title',
          firstName: 'First name',
          lastName: 'Last name',
          phone: 'Phone',
          company: 'Company',
          addressLine1: 'Address line 1',
          addressLine2: 'Address line 2',
          city: 'City',
          state: 'State',
          postalCode: 'Postal code',
          country: 'Country',
          submit: 'Save',

          firstNameRequired: 'First name is required.',
          lastNameRequired: 'Last name is required.',
          addressLine1Required: 'Address line 1 is required.',
          cityRequired: 'City is required.',
          postalCodeRequired: 'Postal code is required.',
          countryRequired: 'Country is required.',
        }

  const onSubmit = useCallback(
    async (data: AddressFormValues) => {
      const newData = deepMergeSimple(initialData || {}, data)

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, newData)
        } else {
          await createAddress(newData)
        }
      }

      if (callback) {
        callback(newData)
      }
    },
    [initialData, skipSubmission, callback, addressID, updateAddress, createAddress],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <FormItem className="shrink">
            <Label htmlFor="title" className="text-stone-800">
              {t.title}
            </Label>

            <Select
              {...register('title')}
              onValueChange={(value) => {
                setValue('title', value, { shouldValidate: true })
              }}
              defaultValue={initialData?.title || ''}
            >
              <SelectTrigger id="title" className="rounded-none">
                <SelectValue placeholder={t.title} />
              </SelectTrigger>

              <SelectContent className="rounded-none">
                {titles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.title && <FormError message={errors.title.message} />}
          </FormItem>

          <FormItem>
            <Label htmlFor="firstName" className="text-stone-800">
              {t.firstName}*
            </Label>

            <Input
              id="firstName"
              autoComplete="given-name"
              {...register('firstName', {
                required: t.firstNameRequired,
              })}
              className="rounded-none"
            />

            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>

          <FormItem>
            <Label htmlFor="lastName" className="text-stone-800">
              {t.lastName}*
            </Label>

            <Input
              autoComplete="family-name"
              id="lastName"
              {...register('lastName', {
                required: t.lastNameRequired,
              })}
              className="rounded-none"
            />

            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <Label htmlFor="phone" className="text-stone-800">
            {t.phone}
          </Label>

          <Input
            type="tel"
            id="phone"
            autoComplete="tel"
            {...register('phone')}
            className="rounded-none"
          />

          {errors.phone && <FormError message={errors.phone.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="company" className="text-stone-800">
            {t.company}
          </Label>

          <Input
            id="company"
            autoComplete="organization"
            {...register('company')}
            className="rounded-none"
          />

          {errors.company && <FormError message={errors.company.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="addressLine1" className="text-stone-800">
            {t.addressLine1}*
          </Label>

          <Input
            id="addressLine1"
            autoComplete="address-line1"
            {...register('addressLine1', {
              required: t.addressLine1Required,
            })}
            className="rounded-none"
          />

          {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="addressLine2" className="text-stone-800">
            {t.addressLine2}
          </Label>

          <Input
            id="addressLine2"
            autoComplete="address-line2"
            {...register('addressLine2')}
            className="rounded-none"
          />

          {errors.addressLine2 && <FormError message={errors.addressLine2.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="city" className="text-stone-800">
            {t.city}*
          </Label>

          <Input
            id="city"
            autoComplete="address-level2"
            className="rounded-none"
            {...register('city', {
              required: t.cityRequired,
            })}
          />

          {errors.city && <FormError message={errors.city.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="state" className="text-stone-800">
            {t.state}
          </Label>

          <Input
            id="state"
            autoComplete="address-level1"
            className="rounded-none"
            {...register('state')}
          />

          {errors.state && <FormError message={errors.state.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="postalCode" className="text-stone-800">
            {t.postalCode}*
          </Label>

          <Input
            id="postalCode"
            autoComplete="postal-code"
            {...register('postalCode', {
              required: t.postalCodeRequired,
            })}
            className="rounded-none"
          />

          {errors.postalCode && <FormError message={errors.postalCode.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="country" className="text-stone-800">
            {t.country}*
          </Label>

          <Select
            {...register('country', {
              required: t.countryRequired,
            })}
            onValueChange={(value) => {
              setValue('country', value, { shouldValidate: true })
            }}
            required
            defaultValue={initialData?.country || ''}
          >
            <SelectTrigger id="country" className="w-full rounded-none">
              <SelectValue placeholder={t.country} />
            </SelectTrigger>

            <SelectContent className="rounded-none">
              {supportedCountries.map((country) => {
                const value = typeof country === 'string' ? country : country.value

                const label =
                  typeof country === 'string'
                    ? country
                    : typeof country.label === 'string'
                      ? country.label
                      : value

                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {errors.country && <FormError message={errors.country.message} />}
        </FormItem>
      </div>

      <Button className="rounded-none" type="submit">
        {t.submit}
      </Button>
    </form>
  )
}
