'use client'

import { useEffect } from 'react'

type NotificationCounts = {
  orders: number
  businessApplications: number
}

type AcknowledgeCollection = 'orders' | 'business-applications'

type NotificationItem = {
  id: AcknowledgeCollection
  slug: string
  key: keyof NotificationCounts
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  { id: 'orders', slug: 'orders', key: 'orders' },
  {
    id: 'business-applications',
    slug: 'business-applications',
    key: 'businessApplications',
  },
]

const POLL_INTERVAL_MS = 30000

function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function isCollectionRootPath(pathname: string, slug: string): boolean {
  const normalized = normalizePathname(pathname)
  return (
    normalized === `/admin/collections/${slug}` ||
    normalized === `/collections/${slug}` ||
    normalized.endsWith(`/admin/collections/${slug}`) ||
    normalized.endsWith(`/collections/${slug}`)
  )
}

function isInCollectionArea(pathname: string, slug: string): boolean {
  const normalized = normalizePathname(pathname)
  const markers = [`/admin/collections/${slug}`, `/collections/${slug}`]
  return markers.some((marker) => {
    if (normalized === marker) return true
    if (!normalized.startsWith(`${marker}/`)) return false
    const rest = normalized.slice(marker.length + 1)
    if (rest === 'create' || rest.startsWith('create/')) return false
    return true
  })
}

function isValidCounts(value: unknown): value is NotificationCounts {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.orders === 'number' &&
    Number.isFinite(v.orders) &&
    typeof v.businessApplications === 'number' &&
    Number.isFinite(v.businessApplications)
  )
}

export function NotificationBadges() {
  useEffect(() => {
    let mounted = true
    let inFlight = false
    let fetchController: AbortController | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null
    const countsRef: { current: NotificationCounts } = {
      current: { orders: 0, businessApplications: 0 },
    }
    const ackInFlight: Record<AcknowledgeCollection, boolean> = {
      orders: false,
      'business-applications': false,
    }
    const ackedInArea: Record<AcknowledgeCollection, boolean> = {
      orders: false,
      'business-applications': false,
    }
    let lastPathname = ''

    const removeBadge = (link: HTMLAnchorElement, id: string) => {
      const badges = link.querySelectorAll<HTMLElement>(`[data-notification-badge="${id}"]`)
      badges.forEach((badge) => badge.remove())
    }

    const updateBadges = () => {
      if (typeof document === 'undefined') return
      const counts = countsRef.current
      const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]')
      anchors.forEach((link) => {
        let pathname: string
        try {
          pathname = normalizePathname(new URL(link.href, window.location.origin).pathname)
        } catch {
          return
        }

        NOTIFICATION_ITEMS.forEach(({ id, slug, key }) => {
          const count = counts[key]
          if (!isCollectionRootPath(pathname, slug)) {
            removeBadge(link, id)
            return
          }

          if (count <= 0) {
            removeBadge(link, id)
            return
          }

          const isSidebar = Boolean(link.closest('nav'))
          const location = isSidebar ? 'sidebar' : 'card'

          let badge = link.querySelector<HTMLElement>(`[data-notification-badge="${id}"]`)
          if (!badge) {
            badge = document.createElement('span')
            badge.dataset.notificationBadge = id
            link.appendChild(badge)
          }

          const expectedClass = `notification-badge notification-badge--${location}`
          if (badge.className !== expectedClass) {
            badge.className = expectedClass
          }
          if (badge.dataset.location !== location) {
            badge.dataset.location = location
          }

          const text = String(count)
          if (badge.textContent !== text) {
            badge.textContent = text
          }

          const duplicates = link.querySelectorAll<HTMLElement>(
            `[data-notification-badge="${id}"]`,
          )
          if (duplicates.length > 1) {
            duplicates.forEach((node, index) => {
              if (index > 0) node.remove()
            })
          }
        })
      })
    }

    const fetchCounts = async (): Promise<void> => {
      if (!mounted || inFlight) return
      inFlight = true
      const controller = new AbortController()
      fetchController = controller
      try {
        const res = await fetch('/api/admin-notifications', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!res.ok) return
        const data: unknown = await res.json()
        if (!isValidCounts(data) || !mounted) return
        countsRef.current = {
          orders: Math.max(0, Math.floor(data.orders)),
          businessApplications: Math.max(0, Math.floor(data.businessApplications)),
        }
        updateBadges()
      } catch {
        // ignore network/abort/parse errors
      } finally {
        if (fetchController === controller) {
          fetchController = null
        }
        inFlight = false
      }
    }

    const acknowledge = async (collection: AcknowledgeCollection): Promise<void> => {
      if (!mounted || ackInFlight[collection]) return
      ackInFlight[collection] = true
      try {
        const res = await fetch('/api/admin-notifications/acknowledge', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection }),
        })
        if (!res.ok || !mounted) return
        await fetchCounts()
      } catch {
        // allow retry on next entry/poll; keep ackedInArea true to avoid storms this visit
      } finally {
        ackInFlight[collection] = false
      }
    }

    const handlePathChange = () => {
      if (typeof window === 'undefined') return
      const pathname = normalizePathname(window.location.pathname)
      if (pathname === lastPathname) return
      lastPathname = pathname

      NOTIFICATION_ITEMS.forEach(({ id, slug }) => {
        const inside = isInCollectionArea(pathname, slug)
        if (!inside) {
          ackedInArea[id] = false
          return
        }
        if (!ackedInArea[id]) {
          ackedInArea[id] = true
          void acknowledge(id)
        }
      })
    }

    const observer = new MutationObserver(() => {
      updateBadges()
      handlePathChange()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args as never)
      handlePathChange()
      return result
    }
    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args as never)
      handlePathChange()
      return result
    }

    window.addEventListener('popstate', handlePathChange)

    void fetchCounts()
    intervalId = setInterval(() => {
      void fetchCounts()
    }, POLL_INTERVAL_MS)
    updateBadges()
    handlePathChange()

    return () => {
      mounted = false
      observer.disconnect()
      window.removeEventListener('popstate', handlePathChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      if (intervalId) clearInterval(intervalId)
      if (fetchController) fetchController.abort()
    }
  }, [])

  return null
}
