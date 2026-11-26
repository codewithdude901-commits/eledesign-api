import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const order = await payload.findByID({
      collection: 'orders',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.readAt) {
      await payload.update({
        collection: 'orders',
        id,
        data: { readAt: new Date().toISOString() },
        overrideAccess: true,
        depth: 0,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark order as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}