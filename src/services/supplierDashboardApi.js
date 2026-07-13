import { adminApiRequest } from './adminApiClient'

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

const normalizeResponse = (response, source = 'api') => ({
  suppliers: (getValue(response, 'suppliers') || []).map(normalizeSupplier),
  activeMonth: String(getValue(response, 'activeMonth') || ''),
  previousMonth: String(getValue(response, 'previousMonth') || ''),
  source,
})

export const supplierDashboardApi = {
  async listSuppliers({ search = '', months = 2, activeOnly = true, signal } = {}) {
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

  async getSupplier({ regNo, months = 2, signal } = {}) {
    const response = await adminApiRequest(`/api/SupplierDashboard/suppliers/${regNo}?months=${months}`, {
      method: 'GET',
      signal,
    })

    return normalizeSupplier(response)
  },
}
