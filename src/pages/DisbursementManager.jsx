import { useState } from 'react'
import { 
  Printer, Download, Package, CheckCircle2,
  Banknote, Sprout, Send, Truck, 
  ChevronDown, CheckCircle, AlertCircle,
  Leaf
} from 'lucide-react'
import { approvedAdvances, approvedFertilizers, approvedItems, routeOptions } from '../data/mockData'
import { downloadPdf } from '../utils/pdf'

const formatDisplayDate = (date) => {
  if (!date) return 'Not set'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

const formatQuantity = (value, unit) => `${Number(value || 0).toLocaleString()} ${unit || ''}`.trim()

const getQuantityBreakdown = (items, type) => {
  return Object.values(items.reduce((groups, item) => {
    const name = type === 'fertilizer' ? item.fertilizerType : item.itemType
    const key = `${name || 'Item'}__${item.unit || ''}`

    if (!groups[key]) {
      groups[key] = {
        name: name || 'Item',
        unit: item.unit || '',
        qty: 0,
      }
    }

    groups[key].qty += Number(item.approvedQty || 0)
    return groups
  }, {}))
}

function DisbursementTableSummary({ items, type }) {
  const supplierCount = new Set(items.map(item => item.regNo)).size
  const isAdvance = type === 'advance'
  const totalAmount = items.reduce((sum, item) => sum + Number(item.approvedAmount || 0), 0)
  const quantityBreakdown = isAdvance ? [] : getQuantityBreakdown(items, type)
  const Icon = isAdvance ? Banknote : type === 'fertilizer' ? Sprout : Package
  const toneClass = isAdvance
    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200'
    : type === 'fertilizer'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/15 dark:text-emerald-200'
      : 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/50 dark:bg-teal-900/15 dark:text-teal-200'
  const valueLabel = isAdvance
    ? 'Advance amount count'
    : type === 'fertilizer'
      ? 'Fertilizer-wise quantity count'
      : 'Item-wise quantity count'

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Supplier count</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{supplierCount}</p>
        </div>

        <div className={`rounded-lg border px-3 py-3 ${toneClass}`}>
          <div className="flex items-center gap-2">
            <Icon size={15} />
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{valueLabel}</p>
          </div>

          {isAdvance ? (
            <p className="mt-1 text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quantityBreakdown.length > 0 ? quantityBreakdown.map(item => (
                <span key={`${item.name}-${item.unit}`} className="rounded-md bg-white/75 px-2.5 py-1 text-xs font-bold ring-1 ring-black/5 dark:bg-slate-950/30">
                  {item.name}: {formatQuantity(item.qty, item.unit)}
                </span>
              )) : (
                <span className="text-sm font-bold">No quantity</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DisbursementManager() {
  const [selectedRoute, setSelectedRoute] = useState('all')
  const [issueTab, setIssueTab] = useState('advance')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentMethods, setPaymentMethods] = useState({})
  const [showSuccess, setShowSuccess] = useState(null)
  const [showError, setShowError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // State for each table's issued items
  const [advancesState, setAdvancesState] = useState(approvedAdvances.map(a => ({ ...a, issued: false })))
  const [fertilizersState, setFertilizersState] = useState(approvedFertilizers.map(f => ({ ...f, issued: false })))
  const [itemsState, setItemsState] = useState(approvedItems.map(i => ({ ...i, issued: false })))

  // Helper function to generate document content for an item
  const generateDocumentContent = (item, type, method = null) => {
    return `
CEYLON TEA FACTORY - SUPPLIER DISBURSEMENT
=============================================
Voucher No: ${type.toUpperCase()}-${item.id}-${Date.now()}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

SUPPLIER INFORMATION
--------------------
Registration No: ${item.regNo}
Supplier Name: ${item.supplierName}

DISBURSEMENT DETAILS
--------------------
${item.approvedAmount ? `Approved Amount: Rs. ${item.approvedAmount.toLocaleString()}/-` : ''}
${item.fertilizerType ? `Fertilizer Type: ${item.fertilizerType}` : ''}
${item.itemType ? `Item Type: ${item.itemType}` : ''}
${item.approvedQty ? `Quantity: ${item.approvedQty} ${item.unit || ''}` : ''}
Payment Method: ${method || (item.approvedAmount ? (paymentMethods[item.id] || 'Not Selected') : 'Physical Delivery')}
Status: Disbursed

AUTHORIZATION
-------------
_________________________
Authorized Signature

_________________________
Supplier Signature

=============================================
Thank you for your partnership with Ceylon Tea Factory
    `
  }

  const downloadFile = downloadPdf

  // Bulk download all documents as separate files
  const handleBulkDownload = async (type, items) => {
    if (items.length === 0) {
      setShowError('No items to download')
      setTimeout(() => setShowError(null), 3000)
      return
    }
    
    setIsDownloading(true)
    setShowSuccess(`Preparing to download ${items.length} documents...`)
    
    // Download each file with a delay to avoid browser blocking
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const method = type === 'advance' ? (paymentMethods[item.id] || 'Not Selected') : 'Physical Delivery'
      const content = generateDocumentContent(item, type, method)
      const filename = `${type}_disbursement_${item.regNo}_${item.supplierName.replace(/\s/g, '_')}_${Date.now()}.pdf`
      
      // Use timeout to trigger downloads sequentially
      await new Promise(resolve => {
        setTimeout(() => {
          downloadFile(content, filename)
          resolve()
        }, i * 500)
      })
    }
    
    setIsDownloading(false)
    setShowSuccess(`${items.length} documents downloaded successfully`)
    setTimeout(() => setShowSuccess(null), 3000)
  }

  // Update payment method for a specific advance request
  const updatePaymentMethod = (id, method) => {
    setPaymentMethods(prev => ({ ...prev, [id]: method }))
  }

  // Handle disburse action
  const handleDisburse = (type, item, method) => {
    if (type === 'advance' && !method) {
      setShowError('Please select a payment method')
      setTimeout(() => setShowError(null), 3000)
      return
    }
    
    // Update the respective state to mark as issued
    if (type === 'advance') {
      setAdvancesState(prev => prev.map(i => i.id === item.id ? { ...i, issued: true } : i))
    } else if (type === 'fertilizer') {
      setFertilizersState(prev => prev.map(i => i.id === item.id ? { ...i, issued: true } : i))
    } else if (type === 'items') {
      setItemsState(prev => prev.map(i => i.id === item.id ? { ...i, issued: true } : i))
    }
    
    setShowSuccess(`${type.toUpperCase()} disbursed to ${item.supplierName}`)
    setTimeout(() => setShowSuccess(null), 3000)
  }

  // Handle print document for single item
  const handlePrint = (item, type) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type.toUpperCase()} Disbursement - ${item.supplierName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; background: white; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2d5a27; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2d5a27; }
            .subtitle { color: #666; margin-top: 5px; }
            .details { margin: 30px 0; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table th, .info-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .info-table th { background-color: #f5f5f5; width: 30%; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍃 CEYLON TEA FACTORY</div>
            <div class="subtitle">Supplier Disbursement Voucher</div>
            <p>Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="details">
            <h3>Disbursement Details</h3>
            <table class="info-table">
              <tr><th>Registration No</th><td>${item.regNo}</td></tr>
              <tr><th>Supplier Name</th><td>${item.supplierName}</td></tr>
              ${item.approvedAmount ? `<tr><th>Approved Amount</th><td>Rs. ${item.approvedAmount.toLocaleString()}/-</td>` : ''}
              ${item.fertilizerType ? `<tr><th>Fertilizer Type</th><td>${item.fertilizerType}</td>` : ''}
              ${item.itemType ? `<tr><th>Item Type</th><td>${item.itemType}</td>` : ''}
              ${item.approvedQty ? `<tr><th>Quantity</th><td>${item.approvedQty} ${item.unit || ''}</td>` : ''}
              <tr><th>Payment Method</th><td>${type === 'advance' ? (paymentMethods[item.id] || 'Not Selected') : 'Physical Delivery'}</td></tr>
              <tr><th>Status</th><td><span style="color: green;">● Disbursed</span></td></tr>
            </table>
          </div>
          <div class="signature">
            <div>_________________<br/>Authorized Signature</div>
            <div>_________________<br/>Supplier Signature</div>
          </div>
          <div class="footer">
            <p>This is a computer generated document. No signature required.</p>
            <p>Thank you for your partnership with Ceylon Tea Factory</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Handle download document for single item
  const handleDownload = (item, type) => {
    const method = type === 'advance' ? (paymentMethods[item.id] || 'Not Selected') : 'Physical Delivery'
    const content = generateDocumentContent(item, type, method)
    const filename = `${type}_disbursement_${item.regNo}_${item.supplierName.replace(/\s/g, '_')}_${Date.now()}.pdf`
    downloadFile(content, filename)
    setShowSuccess(`Downloaded document for ${item.supplierName}`)
    setTimeout(() => setShowSuccess(null), 2000)
  }

  // Handle bulk print
  const handleBulkPrint = (type, items) => {
    if (items.length === 0) {
      setShowError('No items to print')
      setTimeout(() => setShowError(null), 3000)
      return
    }
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk ${type} Disbursements</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2d5a27; }
            .logo { font-size: 24px; font-weight: bold; color: #2d5a27; }
            .page-break { page-break-before: always; margin-top: 40px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍃 CEYLON TEA FACTORY</div>
            <h3>Bulk ${type.toUpperCase()} Disbursements Report</h3>
            <p>Date: ${new Date().toLocaleDateString()} | Total Items: ${items.length}</p>
          </div>
          ${items.map((item, index) => `
            ${index > 0 ? '<div class="page-break"></div>' : ''}
            <h3>Document ${index + 1}: ${item.supplierName}</h3>
            <table>
              <tr><th>Registration No</th><td>${item.regNo}</td></tr>
              <tr><th>Supplier Name</th><td>${item.supplierName}</td></tr>
              ${item.approvedAmount ? `<tr><th>Amount</th><td>Rs. ${item.approvedAmount.toLocaleString()}</td>` : ''}
              ${item.fertilizerType ? `<tr><th>Fertilizer Type</th><td>${item.fertilizerType}</td>` : ''}
              ${item.itemType ? `<tr><th>Item Type</th><td>${item.itemType}</td>` : ''}
              ${item.approvedQty ? `<tr><th>Quantity</th><td>${item.approvedQty} ${item.unit || ''}</td>` : ''}
              <tr><th>Payment Method</th><td>${type === 'advance' ? (paymentMethods[item.id] || 'Not Selected') : 'Physical Delivery'}</td></tr>
            </table>
            <div class="signature">
              <div>_________________<br/>Authorized Signature</div>
              <div>_________________<br/>Supplier Signature</div>
            </div>
            <div class="footer">
              <p>Thank you for your partnership with Ceylon Tea Factory</p>
            </div>
          `).join('')}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const isWithinDateRange = (date) => {
    if (dateFrom && date < dateFrom) return false
    if (dateTo && date > dateTo) return false
    return true
  }

  // Filter by route and approval date
  const filterItems = (items) => {
    return items.filter(item => {
      const routeMatches = selectedRoute === 'all' || item.route === selectedRoute
      return routeMatches && isWithinDateRange(item.approvedDate)
    })
  }

  const filteredAdvances = filterItems(advancesState)
  const filteredFertilizers = filterItems(fertilizersState)
  const filteredItems = filterItems(itemsState)

  const issuedAdvanceCount = filteredAdvances.filter(i => i.issued).length
  const issuedFertilizerCount = filteredFertilizers.filter(i => i.issued).length
  const issuedItemCount = filteredItems.filter(i => i.issued).length
  const pendingTotalCount = filteredAdvances.concat(filteredFertilizers, filteredItems).filter(i => !i.issued).length
  const issuedTotalCount = issuedAdvanceCount + issuedFertilizerCount + issuedItemCount

  // Get pending items counts
  const pendingAdvancesCount = filteredAdvances.filter(i => !i.issued).length
  const pendingFertilizersCount = filteredFertilizers.filter(i => !i.issued).length
  const pendingItemsCount = filteredItems.filter(i => !i.issued).length

  return (
    <div className="space-y-6 p-6">
      {/* Success/Error Toasts */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle size={16} /> {showSuccess}
        </div>
      )}
      {showError && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle size={16} /> {showError}
        </div>
      )}
      
      {/* Downloading indicator */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
            <span className="text-slate-700 dark:text-slate-300">Downloading documents...</span>
          </div>
        </div>
      )}

      {/* Header with Tea Factory branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursement Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Issue approved requests, track disbursements, and confirm receipt</p>
        </div>
      </div>

      {/* Stats Cards - 5 in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">Disbursed Advances</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">{issuedAdvanceCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center">
              <Banknote size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl p-4 border-l-4 border-emerald-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Disbursed Fertilizers</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{issuedFertilizerCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center">
              <Sprout size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 rounded-xl p-4 border-l-4 border-teal-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wide">Disbursed Items</p>
              <p className="text-3xl font-bold text-teal-700 dark:text-teal-300 mt-1">{issuedItemCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-200 dark:bg-teal-800/50 flex items-center justify-center">
              <Package size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">Total Issued</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{issuedTotalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800/50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border-l-4 border-orange-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wide">Still Pending</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1">{pendingTotalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-800/50 flex items-center justify-center">
              <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disbursement filters</span>
          </div>
          <div className="relative">
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
            >
              {routeOptions.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </label>
          {(dateFrom || dateTo || selectedRoute !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoute('all')
                setDateFrom('')
                setDateTo('')
              }}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Disbursement Type Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <button
            onClick={() => setIssueTab('advance')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              issueTab === 'advance' 
                ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Banknote size={16} />
            Advance Disbursement ({pendingAdvancesCount})
          </button>
          <button
            onClick={() => setIssueTab('fertilizer')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              issueTab === 'fertilizer' 
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sprout size={16} />
            Fertilizer Disbursement ({pendingFertilizersCount})
          </button>
          <button
            onClick={() => setIssueTab('items')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              issueTab === 'items' 
                ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package size={16} />
            Item Disbursement ({pendingItemsCount})
          </button>
        </div>
      </div>

      {/* Advance Disbursements Table */}
      {issueTab === 'advance' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-transparent">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Pending Advance Disbursements</h3>
                <p className="text-xs text-slate-500 mt-0.5">{pendingAdvancesCount} requests awaiting disbursement</p>
              </div>
              {pendingAdvancesCount > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkPrint('advance', filteredAdvances.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Printer size={12} /> Print All ({pendingAdvancesCount})
                  </button>
                  <button
                    onClick={() => handleBulkDownload('advance', filteredAdvances.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors shadow-sm"
                  >
                    <Download size={12} /> Download All ({pendingAdvancesCount})
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">RegNo</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Supplier Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Payment Method</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      <Banknote size={32} className="mx-auto mb-2 opacity-30" />
                      No advance requests available
                    </td>
                  </tr>
                ) : (
                  filteredAdvances.map(item => (
                    <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-700/50 ${item.issued ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                      <td className="py-3 px-4 font-mono font-semibold text-green-700 dark:text-green-400">{item.regNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.supplierName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDisplayDate(item.approvedDate)}</td>
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">Rs.{item.approvedAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {item.issued ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <CheckCircle2 size={12} /> Issued via {paymentMethods[item.id] || 'N/A'}
                          </span>
                        ) : (
                          <select
                            value={paymentMethods[item.id] || ''}
                            onChange={(e) => updatePaymentMethod(item.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                          >
                            <option value="">Select Method</option>
                            <option value="Cash">💵 Cash</option>
                            <option value="Bank Transfer">🏦 Bank Transfer</option>
                            <option value="Cheque">📝 Cheque</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!item.issued ? (
                            <button
                              onClick={() => handleDisburse('advance', item, paymentMethods[item.id])}
                              disabled={!paymentMethods[item.id]}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                paymentMethods[item.id]
                                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                              }`}
                            >
                              <Send size={12} /> Disburse
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                              <CheckCircle2 size={12} /> Issued
                            </span>
                          )}
                          <button
                            onClick={() => handlePrint(item, 'advance')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(item, 'advance')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DisbursementTableSummary items={filteredAdvances} type="advance" />
        </div>
      )}

      {/* Fertilizer Disbursements Table */}
      {issueTab === 'fertilizer' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Pending Fertilizer Disbursements</h3>
                <p className="text-xs text-slate-500 mt-0.5">{pendingFertilizersCount} requests awaiting disbursement</p>
              </div>
              {pendingFertilizersCount > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkPrint('fertilizer', filteredFertilizers.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Printer size={12} /> Print All ({pendingFertilizersCount})
                  </button>
                  <button
                    onClick={() => handleBulkDownload('fertilizer', filteredFertilizers.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors shadow-sm"
                  >
                    <Download size={12} /> Download All ({pendingFertilizersCount})
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">RegNo</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Supplier Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Fertilizer Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Qty</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFertilizers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      <Sprout size={32} className="mx-auto mb-2 opacity-30" />
                      No fertilizer requests available
                    </td>
                  </tr>
                ) : (
                  filteredFertilizers.map(item => (
                    <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-700/50 ${item.issued ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                      <td className="py-3 px-4 font-mono font-semibold text-green-700 dark:text-green-400">{item.regNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.supplierName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDisplayDate(item.approvedDate)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
                          <Sprout size={10} /> {item.fertilizerType}
                        </span>
                       </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.approvedQty} {item.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!item.issued ? (
                            <button
                              onClick={() => handleDisburse('fertilizer', item, 'Physical')}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                            >
                              <Send size={12} /> Disburse
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                              <CheckCircle2 size={12} /> Issued
                            </span>
                          )}
                          <button
                            onClick={() => handlePrint(item, 'fertilizer')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(item, 'fertilizer')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))
                )}
             </tbody>
            </table>
          </div>
          <DisbursementTableSummary items={filteredFertilizers} type="fertilizer" />
        </div>
      )}

      {/* Item Disbursements Table */}
      {issueTab === 'items' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-white dark:from-teal-900/10 dark:to-transparent">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Pending Item Disbursements</h3>
                <p className="text-xs text-slate-500 mt-0.5">{pendingItemsCount} requests awaiting disbursement</p>
              </div>
              {pendingItemsCount > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkPrint('item', filteredItems.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Printer size={12} /> Print All ({pendingItemsCount})
                  </button>
                  <button
                    onClick={() => handleBulkDownload('item', filteredItems.filter(i => !i.issued))}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors shadow-sm"
                  >
                    <Download size={12} /> Download All ({pendingItemsCount})
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">RegNo</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Supplier Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Item Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Approved Qty</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      No item requests available
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-700/50 ${item.issued ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                      <td className="py-3 px-4 font-mono font-semibold text-green-700 dark:text-green-400">{item.regNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.supplierName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatDisplayDate(item.approvedDate)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs font-medium">
                          <Package size={10} /> {item.itemType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.approvedQty} {item.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!item.issued ? (
                            <button
                              onClick={() => handleDisburse('items', item, 'Physical')}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm"
                            >
                              <Send size={12} /> Disburse
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                              <CheckCircle2 size={12} /> Issued
                            </span>
                          )}
                          <button
                            onClick={() => handlePrint(item, 'item')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDownload(item, 'item')}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DisbursementTableSummary items={filteredItems} type="items" />
        </div>
      )}
    </div>
  )
}
