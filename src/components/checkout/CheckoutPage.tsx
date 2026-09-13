'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { FormItem } from '@/components/forms/FormItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { cssVariables } from '@/cssVariables'
import { Address } from '@/payload-types'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

const i18n = {
  de: {
    contact: 'Kontakt',
    login: 'Anmelden',
    or: 'oder',
    createAccount: 'ein Konto erstellen',
    notYou: 'Du nicht?',
    logout: 'Abmelden',
    guestCheckoutInstructions: 'Geben Sie Ihre E-Mail-Adresse ein, um als Gast zur Kasse zu gehen.',
    emailAddress: 'E-Mail-Adresse',
    continueAsGuest: 'Als Gast fortfahren',
    address: 'Adresse',
    remove: 'Entfernen',
    billingAddress: 'Rechnungsadresse',
    shippingSameAsBilling: 'Lieferadresse entspricht der Rechnungsadresse.',
    shippingAddress: 'Lieferadresse',
    shippingAddressDescription: 'Bitte wählen Sie eine Lieferadresse aus.',
    goToPayment: 'Zur Zahlung',
    tryAgain: 'Versuchen Sie es erneut',
    payment: 'Zahlung',
    errorPrefix: 'Fehler:',
    cancelPayment: 'Zahlung stornieren',
    yourCart: 'Ihr Warenkorb',
    total: 'gesamt',
    processingPayment: 'Ihre Zahlung wird verarbeitet...',
    cartEmpty: 'Ihr Warenkorb ist leer.',
    continueShopping: 'Weiter einkaufen?',
    defaultErrorMessage: 'Bei der Einleitung der Zahlung ist ein Fehler aufgetreten.',
    outOfStockMessage: 'Ein oder mehrere Artikel in Ihrem Warenkorb sind nicht mehr auf Lager.',
  },
  en: {
    contact: 'Contact',
    login: 'Log in',
    or: 'or',
    createAccount: 'create an account',
    notYou: 'Not you?',
    logout: 'Log out',
    guestCheckoutInstructions: 'Enter your email to checkout as a guest.',
    emailAddress: 'Email Address',
    continueAsGuest: 'Continue as guest',
    address: 'Address',
    remove: 'Remove',
    billingAddress: 'Billing address',
    shippingSameAsBilling: 'Shipping is the same as billing',
    shippingAddress: 'Shipping address',
    shippingAddressDescription: 'Please select a shipping address.',
    goToPayment: 'Go to payment',
    tryAgain: 'Try again',
    payment: 'Payment',
    errorPrefix: 'Error:',
    cancelPayment: 'Cancel payment',
    yourCart: 'Your cart',
    total: 'Total',
    processingPayment: 'Processing your payment...',
    cartEmpty: 'Your cart is empty.',
    continueShopping: 'Continue shopping?',
    defaultErrorMessage: 'An error occurred while initiating payment.',
    outOfStockMessage: 'One or more items in your cart are out of stock.',
  },
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale === 'de' ? 'de' : 'en'
  const t = i18n[locale]

  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = t.defaultErrorMessage

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = t.outOfStockMessage
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress, t],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>{t.processingPayment}</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{t.cartEmpty}</p>
        <Link href="/search">{t.continueShopping}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">{t.contact}</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit rounded-none" variant="outline">
                <Link href={`/${locale}/login`}>{t.login}</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">{t.or}</span>
                <Link href={`/${locale}/create-account`}>{t.createAccount}</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                {t.notYou}{' '}
                <Link className="underline" href={`/${locale}/logout`}>
                  {t.logout}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">{t.guestCheckoutInstructions}</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">{t.emailAddress}</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="rounded-none"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
                className="rounded-none"
              >
                {t.continueAsGuest}
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">{t.address}</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              locale={locale}
              actions={
                <Button
                  variant={'outline'}
                  disabled={Boolean(paymentData)}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                  className="rounded-none"
                >
                  {t.remove}
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses
            heading={t.billingAddress}

            setAddress={setBillingAddress}
            locale={locale}
          />
        ) : (
          <CreateAddressModal
            locale={locale}
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
            className="rounded-none"
          />
          <Label htmlFor="shippingTheSameAsBilling">{t.shippingSameAsBilling}</Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  locale={locale}
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                      className="rounded-none"
                    >
                      {t.remove}
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                locale={locale}

                heading={t.shippingAddress}
                description={t.shippingAddressDescription}
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                locale={locale}
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        {!paymentData && (
          <Button
            className="self-start rounded-none"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              void initiatePaymentIntent('stripe')
            }}
          >
            {t.goToPayment}
          </Button>
        )}

        {!paymentData?.['clientSecret'] && error && (
          <div className="my-8">
            <Message error={error} />

            <Button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              variant="default"
              className="rounded-none"
            >
              {t.tryAgain}
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {/* @ts-ignore */}
          {paymentData && paymentData?.['clientSecret'] && (
            <div className="pb-16">
              <h2 className="font-medium text-3xl">{t.payment}</h2>
              {error && <p>{`${t.errorPrefix} ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '6px',
                      colorPrimary: '#858585',
                      gridColumnSpacing: '20px',
                      gridRowSpacing: '20px',
                      colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon:
                        theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                      colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                      colorTextPlaceholder: '#858585',
                      fontFamily: 'Geist, sans-serif',
                      fontSizeBase: '16px',
                      fontWeightBold: '600',
                      fontWeightNormal: '500',
                      spacingUnit: '4px',
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="outline"
                    className="self-start rounded-none min-w-40"
                    onClick={() => setPaymentData(null)}
                  >
                    {t.cancelPayment}
                  </Button>
                </div>
              </Elements>
            </div>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-4 border-none bg-primary/5 flex flex-col gap-8 ">
          <h2 className="text-3xl font-medium">{t.yourCart}</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const {
                product,
                product: { id, meta, title, gallery, common_name },
                quantity,
                variant,
              } = item

              if (!quantity) return null

              let image = gallery?.[0]?.image || meta?.image
              let price = product?.priceInEUR

              const isVariant = Boolean(variant) && typeof variant === 'object'

              if (isVariant) {
                price = variant?.priceInEUR

                const imageVariant = product.gallery?.find((item) => {
                  if (!item.variantOption) return false
                  const variantOptionID =
                    typeof item.variantOption === 'object'
                      ? item.variantOption.id
                      : item.variantOption

                  const hasMatch = variant?.options?.some((option) => {
                    if (typeof option === 'object') return option.id === variantOptionID
                    else return option === variantOptionID
                  })

                  return hasMatch
                })

                if (imageVariant && typeof imageVariant.image !== 'string') {
                  image = imageVariant.image
                }
              }

              return (
                <div className="flex items-start gap-4" key={index}>
                  <div className="flex items-stretch justify-stretch h-20 w-20 p-2  border shrink-0">
                    <div className="relative w-full h-full ">
                      {image && typeof image !== 'string' && (
                        <Media className="" fill imgClassName="" resource={image} />
                      )}
                    </div>
                  </div>
                  <div className="flex grow justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{common_name}</p>
                      <div className="flex items-center gap-2">
                        {variant && typeof variant === 'object' && (
                          <p className="text-xs tracking-wide">
                            {variant.options
                              ?.map((option) => {
                                if (typeof option === 'object') return option.label
                                return null
                              })
                              .join(', ')}
                          </p>
                        )}
                        <div className="text-sm">
                          {'x'}
                          {quantity}
                        </div>
                      </div>

                      {typeof price === 'number' && <Price amount={price} />}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase text-base font-semibold">{t.total}</span>{' '}
            <Price className="text-2xl font-semibold" amount={cart.subtotal || 0} />
          </div>
        </div>
      )}
    </div>
  )
}
