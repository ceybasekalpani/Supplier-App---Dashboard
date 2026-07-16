import axios from 'axios'
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

    axios.get(protectedUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      responseType: 'blob',
    })
      .then(response => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(response.data)
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
