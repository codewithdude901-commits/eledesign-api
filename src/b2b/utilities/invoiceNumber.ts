import type { Payload } from 'payload'

type CounterDoc = {
  key?: string
  value?: number
}

type CounterCollection = {
  findOneAndUpdate: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: Record<string, unknown>,
  ) => Promise<unknown>
}

type MongoConnection = {
  collection: (name: string) => CounterCollection
}

const getCounterCollection = (payload: Payload): CounterCollection | null => {
  const connection = (payload.db as unknown as { connection?: MongoConnection }).connection
  if (!connection || typeof connection.collection !== 'function') return null

  return connection.collection('counters')
}

export const allocateInvoiceNumber = async ({
  payload,
  prefix,
}: {
  payload: Payload
  prefix: string
}): Promise<string> => {
  const year = new Date().getFullYear()
  const collection = getCounterCollection(payload)

  if (collection) {
    try {
      const raw = await collection.findOneAndUpdate(
        { key: `invoice-${year}` },
        {
          $inc: { value: 1 },
          $setOnInsert: { key: `invoice-${year}` },
        },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )

      const maybeModifyResult = raw as { value?: CounterDoc | number } | null
      const doc =
        maybeModifyResult?.value && typeof maybeModifyResult.value === 'object'
          ? maybeModifyResult.value
          : (raw as CounterDoc | null)

      const nextValue = Number(doc?.value ?? 1)
      return `${prefix}-${year}-${String(nextValue).padStart(5, '0')}`
    } catch {
      // Fall through to the timestamp-based fallback below.
    }
  }

  return `${prefix}-${year}-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`
}
