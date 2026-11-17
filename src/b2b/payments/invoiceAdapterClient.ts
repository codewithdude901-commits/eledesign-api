import type { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'

export const invoiceAdapterClient = (): PaymentAdapterClient => ({
  confirmOrder: true,
  initiatePayment: true,
  label: 'Invoice / Bank Transfer',
  name: 'invoice',
})
