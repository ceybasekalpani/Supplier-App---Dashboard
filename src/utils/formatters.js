export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

export const formatQuantity = (value, unit = '') => `${Number(value || 0).toLocaleString()} ${unit}`.trim()

export const formatDisplayDate = (date) => {
  if (!date) return 'Not set'

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
