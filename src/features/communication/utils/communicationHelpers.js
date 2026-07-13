import { Bell, Newspaper } from 'lucide-react'

export const tabs = [
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export const audienceOptions = [
  { value: 'AllSuppliers', label: 'All suppliers' },
  { value: 'Route', label: 'Route wise' },
  { value: 'SpecificSupplier', label: 'Specific supplier' },
]

export const notificationTypeOptions = [
  { value: 'General', label: 'General' },
  { value: 'News', label: 'News' },
  { value: 'Request', label: 'Request' },
  { value: 'Fertilizer', label: 'Fertilizer' },
  { value: 'Item', label: 'Item' },
]

export const newsFilters = ['all', 'active', 'draft', 'expired']
export const notificationFilters = ['all', 'scheduled', 'delivered', 'failed']

export const themedPrimary = {
  backgroundColor: 'var(--theme-primary)',
  color: 'var(--theme-white)',
}

export const themedPrimarySoft = {
  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
  borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
  color: 'var(--theme-primary)',
}

export const themedPrimaryBorder = {
  borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
}

export const themedInput = {
  borderColor: 'var(--theme-border)',
  '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
}

export function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function countStatus(items, status) {
  return status === 'all' ? items.length : items.filter(item => item.status === status).length
}

export const isValidRegNo = value => /^\d+$/.test(String(value || '').trim())

export const emptyNewsForm = () => ({ title: '', description: '', expiryDate: '', audienceType: 'AllSuppliers', targetRegNo: '', targetRoute: '' })

export const emptyNotifForm = () => ({ title: '', message: '', schedule: '', type: 'General', audienceType: 'AllSuppliers', targetRegNo: '', targetRoute: '' })

export const getAudienceLabel = (item) => {
  if (item.audienceType === 'SpecificSupplier') return `Supplier ${item.targetRegNo || '-'}`
  if (item.audienceType === 'Route') return `Route ${item.targetRoute || '-'}`
  return 'All suppliers'
}

export const isWithinDeleteWindow = (item) => {
  const sourceDate = item.createdAt || item.created || item.sentAt || item.scheduledFor
  const createdTime = new Date(sourceDate).getTime()

  if (!sourceDate || Number.isNaN(createdTime)) return false

  return Date.now() - createdTime <= 24 * 60 * 60 * 1000
}
