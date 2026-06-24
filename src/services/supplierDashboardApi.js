import { env } from '../config/env'
import { advanceRequests, fertilizerRequests, itemRequests, suppliers } from '../data/mockData'
import { adminApiRequest } from './adminApiClient'
import { shouldUseApi } from './apiClient'

const getValue = (source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => (
  source?.[camelKey] ?? source?.[pascalKey]
)

const normalizeStatus = (status) => String(status || 'pending').toLowerCase()

const normalizeRequest = (request, kind) => {
  const normalized = {
    id: getValue(request, 'id') ?? getValue(request, 'requestNo') ?? `${kind}-${Math.random()}`,
    requestNo: String(getValue(request, 'requestNo') || ''),
    regNo: String(getValue(request, 'regNo') || ''),
    type: String(getValue(request, 'type') || getValue(request, 'itemType') || getValue(request, 'fertilizerType') || ''),
    salaryDate: String(getValue(request, 'salaryDate') || getValue(request, 'month') || getValue(request, 'date') || getValue(request, 'requestDate') || ''),
    month: String(getValue(request, 'month') || getValue(request, 'salaryDate') || ''),
    date: String(getValue(request, 'date') || getValue(request, 'salaryDate') || getValue(request, 'month') || getValue(request, 'requestDate') || ''),
    status: normalizeStatus(getValue(request, 'status')),
    checkedBy: String(getValue(request, 'checkedBy') || getValue(request, 'approvedBy') || '-'),
    remarks: getValue(request, 'remarks') || '',
  }

  if (kind === 'advance') {
    normalized.amount = Number(getValue(request, 'amount') || 0)
  } else {
    normalized.qty = Number(getValue(request, 'qty') || getValue(request, 'quantity') || 0)
    normalized.unit = String(getValue(request, 'unit') || '')
  }

  return normalized
}

const normalizeSupplier = (supplier) => ({
  id: getValue(supplier, 'id') ?? getValue(supplier, 'regNo'),
  regNo: String(getValue(supplier, 'regNo') || ''),
  name: String(getValue(supplier, 'name') || getValue(supplier, 'regName') || ''),
  route: String(getValue(supplier, 'route') || ''),
  phone: String(getValue(supplier, 'phone') || getValue(supplier, 'telNo') || ''),
  phone2: getValue(supplier, 'phone2') || getValue(supplier, 'telNo_2') || '',
  phone3: getValue(supplier, 'phone3') || getValue(supplier, 'telNo_3') || '',
  address: String(getValue(supplier, 'address') || ''),
  bank: String(getValue(supplier, 'bank') || ''),
  branch: String(getValue(supplier, 'branch') || ''),
  accountNo: String(getValue(supplier, 'accountNo') || ''),
  payment: String(getValue(supplier, 'payment') || ''),
  status: normalizeStatus(getValue(supplier, 'status') || 'inactive'),
  advanceRequests: (getValue(supplier, 'advanceRequests') || []).map(request => normalizeRequest(request, 'advance')),
  fertilizerRequests: (getValue(supplier, 'fertilizerRequests') || []).map(request => normalizeRequest(request, 'fertilizer')),
  itemRequests: (getValue(supplier, 'itemRequests') || []).map(request => normalizeRequest(request, 'item')),
})

const getMonthKey = (date) => date.toISOString().slice(0, 7)

const buildMockResponse = ({ search = '', months = 2, activeOnly = true } = {}) => {
  const today = new Date()
  const activeMonth = getMonthKey(today)
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const previousMonth = getMonthKey(previousMonthDate)

  const visibleMonths = new Set(
    Array.from({ length: months }, (_, index) => {
      const month = new Date(today.getFullYear(), today.getMonth() - index, 1)
      return getMonthKey(month)
    })
  )

  const term = search.trim().toLowerCase()

  const visibleSuppliers = suppliers
    .filter(supplier => !activeOnly || supplier.status === 'active')
    .filter(supplier => (
      !term ||
      supplier.name.toLowerCase().includes(term) ||
      supplier.regNo.toLowerCase().includes(term) ||
      supplier.route.toLowerCase().includes(term)
    ))
    .map(supplier => {
      const inVisibleMonth = request => visibleMonths.has(String(request.date || '').slice(0, 7))

      return normalizeSupplier({
        ...supplier,
        advanceRequests: advanceRequests.filter(request => request.regNo === supplier.regNo && inVisibleMonth(request)),
        fertilizerRequests: fertilizerRequests.filter(request => request.regNo === supplier.regNo && inVisibleMonth(request)),
        itemRequests: itemRequests.filter(request => request.regNo === supplier.regNo && inVisibleMonth(request)),
      })
    })

  return {
    suppliers: visibleSuppliers,
    activeMonth,
    previousMonth,
    source: 'mock',
  }
}

const normalizeResponse = (response, source = 'api') => ({
  suppliers: (getValue(response, 'suppliers') || []).map(normalizeSupplier),
  activeMonth: String(getValue(response, 'activeMonth') || ''),
  previousMonth: String(getValue(response, 'previousMonth') || ''),
  source,
})

const withMockFallback = async (request, mockFactory) => {
  if (!shouldUseApi()) {
    return mockFactory()
  }

  try {
    return await request()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    if (env.enableMockData) {
      return {
        ...mockFactory(),
        warning: error.message,
      }
    }

    throw error
  }
}

export const supplierDashboardApi = {
  listSuppliers: ({ search = '', months = 2, activeOnly = true, signal } = {}) => (
    withMockFallback(
      async () => {
        const params = new URLSearchParams({
          months: String(months),
          activeOnly: String(activeOnly),
        })

        if (search.trim()) {
          params.set('search', search.trim())
        }

        const response = await adminApiRequest(`/api/SupplierDashboard/suppliers?${params.toString()}`, {
          method: 'GET',
          signal,
        })

        return normalizeResponse(response)
      },
      () => buildMockResponse({ search, months, activeOnly })
    )
  ),

  getSupplier: ({ regNo, months = 2, signal } = {}) => (
    withMockFallback(
      async () => {
        const response = await adminApiRequest(`/api/SupplierDashboard/suppliers/${regNo}?months=${months}`, {
          method: 'GET',
          signal,
        })

        return normalizeSupplier(response)
      },
      () => buildMockResponse({ months, activeOnly: false }).suppliers.find(supplier => (
        supplier.regNo === String(regNo) || String(supplier.id) === String(regNo)
      ))
    )
  ),
}
