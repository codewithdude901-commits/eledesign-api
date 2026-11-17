import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { handleAcknowledgeAdminNotifications } from '@/notifications/adminNotifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { status, body } = await handleAcknowledgeAdminNotifications(
    payload,
    await getHeaders(),
    request,
  )
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
