'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isConfirming = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) return

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')
    const redirectStatus = searchParams.get('redirect_status')

    if (!paymentIntentID || !email) return

    if (redirectStatus !== 'succeeded') {
      setError('Payment was not successful. Please contact support if money was deducted.')
      return
    }

    if (isConfirming.current) return

    isConfirming.current = true

    const confirm = async () => {
      try {
        const result = await confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
            customerEmail: email,
          },
        })

        if (
          result &&
          typeof result === 'object' &&
          'orderID' in result &&
          result.orderID
        ) {
          const accessToken =
            'accessToken' in result
              ? (result.accessToken as string)
              : ''

          const queryParams = new URLSearchParams()

          queryParams.set('email', email)

          if (accessToken) {
            queryParams.set('accessToken', accessToken)
          }

          router.push(
            `/orders/${result.orderID}?${queryParams.toString()}`,
          )
        } else {
          setError('We could not confirm your order. Please contact support.')
          isConfirming.current = false
        }
      } catch (err) {
        console.error('Order confirmation failed:', err)

        setError(
          'There was a problem confirming your order. Please contact support.',
        )

        isConfirming.current = false
      }
    }

    void confirm()
  }, [cart, confirmOrder, router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">
          Please do not attempt another payment until the payment status
          has been verified.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
