import type { Payload } from 'payload'

export type B2BSettingsRecord = {
  bankAccountHolder?: null | string
  bankName?: null | string
  bic?: null | string
  iban?: null | string
  invoiceDueDays?: null | number
  invoiceFooterText?: null | string
  invoiceNumberPrefix?: null | string
  minimumOrderValue?: null | number
  orderNotificationEmail?: null | string
  vatRatePercent?: null | number
}

const SETTINGS_CACHE_MS = 60_000
let settingsCache: { at: number; value: B2BSettingsRecord } | null = null

export const getB2BSettings = async (payload: Payload): Promise<B2BSettingsRecord> => {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_CACHE_MS) {
    return settingsCache.value
  }

  const settings = ((await payload.findGlobal({
    depth: 0,
    overrideAccess: true,
    slug: 'b2b-settings',
  })) as unknown as B2BSettingsRecord) || {}

  settingsCache = {
    at: Date.now(),
    value: settings,
  }

  return settings
}
