'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { sendOrderAccessEmail } from './sendOrderAccessEmail'

type FormData = {
  email: string
  orderID: string
}

type Props = {
  initialEmail?: string
  locale: 'de' | 'en'
}

export const FindOrderForm: React.FC<Props> = ({ initialEmail, locale }) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>({
    defaultValues: {
      email: initialEmail || user?.email,
    },
  })

  const onSubmit = useCallback(async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await sendOrderAccessEmail({
        email: data.email,
        orderID: data.orderID,
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  if (success) {
    return (
      <Fragment>
        <h1 className="text-xl mb-4">
          {locale === 'de' ? 'Überprüfen Sie Ihre E-Mails.' : 'Check your email'}
          </h1>
        <div className="prose dark:prose-invert">
          <p>
            {locale === 'de'
              ? 'Falls eine Bestellung mit der angegebenen E-Mail-Adresse und Bestellnummer existiert, haben wir Ihnen eine E-Mail mit einem Link zur Ansicht Ihrer Bestelldetails gesendet.'
              : 'If an order exists with the provided email and order ID, we have sent you an email with a link to view your order details.'}
          </p>
        </div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <h1 className="text-xl mb-4">
        {locale === 'de' ? 'Meine Bestellung finden' : 'Find my order'}
        </h1>
      <div className="prose dark:prose-invert mb-8">
        <p>
          {locale === 'de'
            ? 'Bitte geben Sie unten Ihre E-Mail-Adresse und Ihre Bestellnummer ein. Wir senden Ihnen einen Link, über den Sie Ihre Bestellung einsehen können.'
            : 'Please enter your email and order ID below. We will send you a link to view your order.'}
          {``}
        </p>
      </div>
      <form className="max-w-lg flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            {locale === 'de' ? 'E-Mail-Adresse' : 'Email address'}
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'Email is required.' })}
            type="email"
            className="rounded-none"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>
        <FormItem>
          <Label htmlFor="orderID" className="mb-2">
            {locale === 'de' ? 'Bestellnummer' : 'Order ID'}
          </Label>
          <Input
            id="orderID"
            {...register('orderID', {
              required: 'Order ID is required.',
            })}
            type="text"
            className="rounded-none"
          />
          {errors.orderID && <FormError message={errors.orderID.message} />}
        </FormItem>
        {submitError && <FormError message={submitError} />}
        <Button
          type="submit"
          className="self-start rounded-none"
          variant="default"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? locale === 'de'
              ? 'Wird gesendet...'
              : 'Sending...'
            : locale === 'de'
              ? 'Bestellung suchen'
              : 'Find order'}
        </Button>
      </form>
    </Fragment>
  )
}
