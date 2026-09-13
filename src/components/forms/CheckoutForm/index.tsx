'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Address } from '@/payload-types'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { FormEvent, useCallback, useState } from 'react'

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

export const CheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  setProcessingPayment,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = React.useState<null | string>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const router = useRouter()
  const params = useParams<{ locale: 'de' | 'en' }>()
  const locale = params?.locale || 'de'

  const { clearCart } = useCart()
  const { confirmOrder } = usePayments()

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!termsAccepted) {
        setError(
          locale === 'de'
            ? 'Bitte stimmen Sie den AGB und der Widerrufsbelehrung zu.'
            : 'Please agree to the Terms & Conditions and Right of Withdrawal.',
        )
        return
      }

      setIsLoading(true)
      setProcessingPayment(true)

      if (stripe && elements) {
        try {
          const returnUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/confirm-order${customerEmail ? `?email=${customerEmail}` : ''}`

          const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            confirmParams: {
              return_url: returnUrl,
              payment_method_data: {
                billing_details: {
                  email: customerEmail,
                  phone: billingAddress?.phone,
                  address: {
                    line1: billingAddress?.addressLine1,
                    line2: billingAddress?.addressLine2,
                    city: billingAddress?.city,
                    state: billingAddress?.state,
                    postal_code: billingAddress?.postalCode,
                    country: billingAddress?.country,
                  },
                },
              },
            },
            elements,
            redirect: 'if_required',
          })

          if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
              const confirmResult = await confirmOrder('stripe', {
                additionalData: {
                  paymentIntentID: paymentIntent.id,
                  ...(customerEmail ? { customerEmail } : {}),
                },
              })

              if (
                confirmResult &&
                typeof confirmResult === 'object' &&
                'orderID' in confirmResult &&
                confirmResult.orderID
              ) {
                const accessToken =
                  'accessToken' in confirmResult ? (confirmResult.accessToken as string) : ''
                const queryParams = new URLSearchParams()

                if (customerEmail) {
                  queryParams.set('email', customerEmail)
                }
                if (accessToken) {
                  queryParams.set('accessToken', accessToken)
                }

                const queryString = queryParams.toString()
                const redirectUrl = `/orders/${confirmResult.orderID}${queryString ? `?${queryString}` : ''}`

                clearCart()
                router.push(redirectUrl)
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Something went wrong.'
              setError(`Error while confirming order: ${msg}`)
              setIsLoading(false)
            }
          }
          if (stripeError?.message) {
            setError(stripeError.message)
            setIsLoading(false)
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Something went wrong.'
          setError(`Error while submitting payment: ${msg}`)
          setIsLoading(false)
          setProcessingPayment(false)
        }
      }
    },
    [
      termsAccepted,
      locale,
      setProcessingPayment,
      stripe,
      elements,
      customerEmail,
      billingAddress?.phone,
      billingAddress?.addressLine1,
      billingAddress?.addressLine2,
      billingAddress?.city,
      billingAddress?.state,
      billingAddress?.postalCode,
      billingAddress?.country,
      confirmOrder,
      clearCart,
      router,
    ],
  )

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message error={error} />}

      <PaymentElement
        options={{ layout: { type: 'accordion', defaultCollapsed: false, radios: true } }}
      />

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
          className="rounded-none mt-1"
        />
        <Label htmlFor="terms" className="text-xs leading-normal cursor-pointer font-normal">
          {locale === 'de' ? (
            <>
              Ich habe die{' '}
              <Link
                href={`/${locale}/terms`}
                target="_blank"
                className="underline underline-offset-2 font-medium hover:text-black"
              >
                AGB
              </Link>{' '}
              und die{' '}
              <Link
                href={`/${locale}/cancellation-policy`}
                target="_blank"
                className="underline underline-offset-2 font-medium hover:text-black"
              >
                Widerrufsbelehrung
              </Link>{' '}
              gelesen und stimme diesen ausdrücklich zu.
            </>
          ) : (
            <>
              I have read and agree to the{' '}
              <Link
                href={`/${locale}/terms`}
                target="_blank"
                className="underline underline-offset-2 font-medium hover:text-black"
              >
                Terms &amp; Conditions
              </Link>{' '}
              and the{' '}
              <Link
                href={`/${locale}/cancellation-policy`}
                target="_blank"
                className="underline underline-offset-2 font-medium hover:text-black"
              >
                Right of Withdrawal
              </Link>
              .
            </>
          )}
        </Label>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {locale === 'de'
          ? 'Alle Preise enthalten die gesetzliche MwSt. zzgl. Versandkosten.'
          : 'All prices include statutory VAT plus shipping fees.'}
      </p>

      <div className="mt-6 flex gap-4">
        <Button
          disabled={!stripe || isLoading || !termsAccepted}
          type="submit"
          variant="default"
          className="rounded-none min-w-40"
        >
          {isLoading
            ? locale === 'de'
              ? 'Wird verarbeitet...'
              : 'Processing...'
            : locale === 'de'
              ? 'Jetzt kaufen'
              : 'Buy now'}
        </Button>
      </div>
    </form>
  )
}
