import { useEffect, useState } from 'react'
import { env } from '../config/env'
import { adminAuthStorage } from '../services/adminApiClient'

const API_BASE_URL = env.apiBaseUrl || env.API_BASE_URL || ''


const isProtectedApiUrl = (url) => {
  if (!url) return false
  const value = String(url)
  if (/^(data:|blob:)/i.test(value)) return false
  if (API_BASE_URL && value.startsWith(API_BASE_URL)) return true
  return value.startsWith('/api/')
}

export function useAuthenticatedImageSrc(url) {
  const protectedUrl = isProtectedApiUrl(url) ? url : null
  const [trackedUrl, setTrackedUrl] = useState(protectedUrl)
  const [blobSrc, setBlobSrc] = useState(null)

  if (trackedUrl !== protectedUrl) {
    setTrackedUrl(protectedUrl)
    if (blobSrc !== null) setBlobSrc(null)
  }

  useEffect(() => {
    if (!protectedUrl) return

    let objectUrl = null
    let cancelled = false
    const token = adminAuthStorage.getToken()

    fetch(protectedUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.blob()
      })
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setBlobSrc(null)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [protectedUrl])

  return protectedUrl ? blobSrc : (url || null)
}
