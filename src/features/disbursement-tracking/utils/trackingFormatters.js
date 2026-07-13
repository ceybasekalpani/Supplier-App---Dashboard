export const formatDisplayDate = (date) => {
  if (!date) return '-'

  const textDate = String(date).slice(0, 10)
  const parsedDate = new Date(`${textDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) return '-'

  return parsedDate.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export const formatOptionalDate = (date) => date ? formatDisplayDate(date) : '-'

export const hasDisplayTime = (date) => {
  const value = String(date || '')
  return value.includes('T') || /\d{1,2}:\d{2}/.test(value)
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  if (!hasDisplayTime(date)) return formatDisplayDate(date)

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return formatDisplayDate(date)

  return parsedDate.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

export const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

export const formatByUnit = (value, unit) => {
  if (unit === 'Rs') return formatCurrency(value)

  const cleanUnit = unit && unit !== '-' ? unit : ''
  return formatQuantity(value, cleanUnit)
}

export const sanitizeFilenamePart = (value) => (
  String(value || '')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
)
