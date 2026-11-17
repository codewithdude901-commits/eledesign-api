import { describe, expect, it } from 'vitest'

import { enforceLoginPortal } from '@/collections/Users/hooks/enforceLoginPortal'

const businessUser = {
  accountType: 'b2b' as const,
  b2b: {
    status: 'approved' as const,
  },
}

const makeRequest = ({
  headers = {},
  pathname = '/api/users/login',
  portal,
}: {
  headers?: Record<string, string>
  pathname?: string
  portal?: string
}) => ({
  data: portal ? { portal } : {},
  headers: new Headers(headers),
  pathname,
  url: pathname,
})

const runHook = (request: ReturnType<typeof makeRequest>) =>
  enforceLoginPortal({
    req: request,
    user: businessUser,
  } as never)

describe('business login portal guard', () => {
  it('allows an approved business user to log in with the business marker', () => {
    const result = runHook(
      makeRequest({
        headers: { 'x-b2b-portal': 'true' },
        pathname: '/api/users/login',
      }),
    )

    expect(result).toBe(businessUser)
  })

  it('rejects a business user on the B2C login endpoint', () => {
    expect(() =>
      runHook(
        makeRequest({
          pathname: '/api/users/login',
          portal: 'b2c',
        }),
      ),
    ).toThrow(/business login portal/i)
  })

  it('allows a business user to set a password through reset-password', () => {
    const result = runHook(
      makeRequest({
        headers: { 'x-b2b-portal': 'true' },
        pathname: '/api/users/reset-password',
        portal: 'business',
      }),
    )

    expect(result).toBe(businessUser)
  })

  it('allows a valid business reset even without the portal marker', () => {
    const result = runHook(
      makeRequest({
        pathname: '/api/users/reset-password',
      }),
    )

    expect(result).toBe(businessUser)
  })
})
