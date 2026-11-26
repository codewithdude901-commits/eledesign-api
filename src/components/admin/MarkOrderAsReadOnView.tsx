'use client'

import { useEffect } from 'react'

function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function isOrderDetailView(pathname: string): string | null {
  const normalized = normalizePathname(pathname)
  const match = normalized.match(/\/admin\/collections\/orders\/([^\/]+)$/)
  if (match && match[1] !== 'create') {
    return match[1]
  }
  return null
}

export function MarkOrderAsReadOnView() {
  useEffect(() => {
    let mounted = true
    let lastOrderId: string | null = null

    const checkAndMark = async () => {
      if (typeof window === 'undefined') return
      const orderId = isOrderDetailView(window.location.pathname)
      if (!orderId || orderId === lastOrderId) return
      lastOrderId = orderId

      try {
        const response = await fetch(`/api/orders/${orderId}/mark-read`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok && mounted) {
          console.warn('Failed to mark order as read:', response.status)
        }
      } catch (error) {
        if (mounted) {
          console.warn('Error marking order as read:', error)
        }
      }
    }

    const handlePathChange = () => {
      checkAndMark()
    }

    const observer = new MutationObserver(() => {
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

    checkAndMark()

    return () => {
      mounted = false
      observer.disconnect()
      window.removeEventListener('popstate', handlePathChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  return null
}