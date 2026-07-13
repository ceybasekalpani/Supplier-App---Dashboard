import { Droplet, Package, ShoppingBag } from 'lucide-react'
import { formatCurrency, formatQuantity } from '../../../utils/formatters'

export const REQUEST_TYPES = [
  { id: 'advance', label: 'Advance', icon: Droplet, tone: 'amber' },
  { id: 'fertilizer', label: 'Fertilizer', icon: Package, tone: 'green' },
  { id: 'item', label: 'Items', icon: ShoppingBag, tone: 'teal' },
]

export const REQUEST_COLLECTION = {
  advance: 'advanceRequests',
  fertilizer: 'fertilizerRequests',
  item: 'itemRequests',
}

export const EMPTY_DASH = '-'

export const monthLabel = (month) => {
  if (!month) return EMPTY_DASH

  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-LK', {
    month: 'short',
    year: 'numeric',
  })
}

export const getRequestTitle = (request, type) => {
  if (type === 'advance') return formatCurrency(request.amount)
  return `${request.type || 'Request'} - ${formatQuantity(request.qty, request.unit)}`
}

export const requestCounts = (supplier) => ({
  advance: supplier?.advanceRequests?.length || 0,
  fertilizer: supplier?.fertilizerRequests?.length || 0,
  item: supplier?.itemRequests?.length || 0,
})
