'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const ConfirmOrder: React.FC<{ locale?: string }> = ({ locale: localeProp }) => {
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = localeProp || 'de'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.cookie = `locale=${locale}; path=/; SameSite=Lax`
    }
  }, [locale])

  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) return

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')

    if (paymentIntentID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
            ...(email ? { customerEmail: email } : {}),
            locale,

          },
        })
          .then((result) => {
            if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
              const accessToken =
                'accessToken' in result ? (result.accessToken as string) : ''
              const queryParams = new URLSearchParams()

              if (email) {
                queryParams.set('email', email)
              }
              if (accessToken) {
                queryParams.set('accessToken', accessToken)
              }

              const queryString = queryParams.toString()
              const prefix = locale === 'en' ? 'en/' : ''
              clearCart()
              router.push(
                `/${prefix}orders/${result.orderID}${queryString ? `?${queryString}` : ''}`,
              )
            } else {
              isConfirming.current = false
            }
          })
          .catch((err) => {
            console.error('Order confirmation failed:', err)
            isConfirming.current = false
          })
      }
    } else {
      const prefix = locale === 'en' ? 'en/' : ''
      router.push(`/${prefix}`)
    }
  }, [cart, clearCart, confirmOrder, locale, router, searchParams])

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl">{locale === 'de' ? 'Bestellung wird bestätigt' : 'Confirming Order'}</h1>

      <LoadingSpinner className="w-12 h-6" />
    </div>
  )
}
