import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

let payload: Payload
let applicationID: number | string | undefined
let applicantEmail: string | undefined

beforeAll(async () => {
  payload = await getPayload({ config })
  applicantEmail = `b2b-approval-test-${Date.now()}@example.com`

  const application = await payload.create({
    collection: 'business-applications',
    data: {
      companyName: 'Approval Test GmbH',
      contactName: 'Approval Test',
      email: applicantEmail,
      status: 'pending',
      termsAccepted: true,
    } as never,
    overrideAccess: true,
  })

  applicationID = application.id
})

afterAll(async () => {
  if (applicantEmail) {
    await payload.delete({
      collection: 'users',
      overrideAccess: true,
      where: {
        email: {
          equals: applicantEmail,
        },
      },
    })
  }

  if (applicationID) {
    await payload.delete({
      collection: 'business-applications',
      id: applicationID,
      overrideAccess: true,
    })
  }
})

describe('business application approval', () => {
  it('creates an approved B2B user and links it without a write conflict', async () => {
    const application = await payload.update({
      collection: 'business-applications',
      data: {
        status: 'approved',
      },
      id: applicationID!,
      overrideAccess: true,
    })

    expect(application.status).toBe('approved')
    expect(application.user).toBeTruthy()

    const users = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      showHiddenFields: true,
      where: {
        email: {
          equals: applicantEmail!,
        },
      },
    })

    const user = users.docs[0] as
      | {
          accountType?: string | null
          b2b?: { status?: string | null } | null
          resetPasswordToken?: string | null
          roles?: string[] | null
        }
      | undefined

    expect(user).toBeTruthy()
    expect(user?.accountType).toBe('b2b')
    expect(user?.b2b?.status).toBe('approved')
    expect(user?.roles).toEqual(expect.arrayContaining(['customer', 'b2b']))
    expect(user?.resetPasswordToken).toBeTruthy()
  })
})
