import { useEffect, useState } from 'react'
import { Check, Flower2, Info, Package, Pencil, Plus, RefreshCw, Save, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { fertilizerItemConfigurationsApi } from '../services/fertilizerItemConfigurationsApi'

const configMeta = {
  fertilizer: {
    label: 'Fertilizer',
    plural: 'Fertilizer Types',
    icon: Flower2,
    placeholder: 'e.g., Organic Compost',
  },
  items: {
    label: 'Item',
    plural: 'Item Types',
    icon: Package,
    placeholder: 'e.g., Leaf Collection Basket',
  },
}

const themedAccent = {
  icon: {
    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
    color: 'var(--theme-primary)',
  },
  selected: {
    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
  },
  border: {
    borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
  },
  button: {
    backgroundColor: 'var(--theme-primary)',
    color: 'var(--theme-white)',
  },
}

export default function Configurations() {
  const [tab, setTab] = useState('fertilizer')
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSavingId, setActiveSavingId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [fertilizerList, setFertilizerList] = useState([])
  const [itemList, setItemList] = useState([])

  const meta = configMeta[tab]
  const TypeIcon = meta.icon
  const items = tab === 'fertilizer' ? fertilizerList : itemList

  useEffect(() => {
    const controller = new AbortController()

    fertilizerItemConfigurationsApi
      .list({ includeInactive: true, signal: controller.signal })
      .then(result => {
        setFertilizerList(result.fertilizer)
        setItemList(result.items)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Unable to load configurations')
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [refreshKey])

  const resetForm = () => {
    setName('')
    setEditingId(null)
    setError('')
  }

  const switchTab = (nextTab) => {
    setTab(nextTab)
    resetForm()
  }

  const showToast = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const refreshConfigurations = () => {
    setLoading(true)
    setLoadError('')
    setRefreshKey(current => current + 1)
  }

  const updateCurrentList = (updater) => {
    if (tab === 'fertilizer') {
      setFertilizerList(previous => updater(previous))
      return
    }

    setItemList(previous => updater(previous))
  }

  const handleSave = async () => {
    if (saving) return

    const cleanName = name.trim()

    if (!cleanName) {
      setError('Name is required.')
      return
    }

    const duplicate = items.some(item => item.name.toLowerCase() === cleanName.toLowerCase() && item.id !== editingId)
    if (duplicate) {
      setError(`${cleanName} is already registered.`)
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingId) {
        const currentItem = items.find(item => item.id === editingId)
        const updatedItem = await fertilizerItemConfigurationsApi.update({
          category: tab,
          id: editingId,
          name: cleanName,
          isActive: currentItem?.isActive ?? true,
        })

        updateCurrentList(previous => previous.map(item => (
          item.id === editingId ? updatedItem : item
        )))

        showToast(`${cleanName} updated successfully.`)
      } else {
        const newItem = await fertilizerItemConfigurationsApi.create({
          category: tab,
          name: cleanName,
        })

        updateCurrentList(previous => [...previous, newItem])
        showToast(`${cleanName} registered successfully.`)
      }

      resetForm()
    } catch (error) {
      setError(error.message || 'Unable to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  const handleActiveChange = async (item) => {
    if (activeSavingId) return

    setActiveSavingId(item.id)
    setLoadError('')

    try {
      const updatedItem = await fertilizerItemConfigurationsApi.setActive({
        category: tab,
        id: item.id,
        isActive: !item.isActive,
      })

      updateCurrentList(previous => previous.map(row => (
        row.id === item.id ? updatedItem : row
      )))

      if (editingId === item.id) {
        setEditingId(updatedItem.id)
      }

      showToast(`${updatedItem.name} ${updatedItem.isActive ? 'activated' : 'deactivated'} successfully.`)
    } catch (error) {
      setLoadError(error.message || 'Unable to update configuration status')
    } finally {
      setActiveSavingId(null)
    }
  }

  const handleEdit = (item) => {
    setName(item.name)
    setEditingId(item.id)
    setError('')
    document.getElementById('configuration-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNameChange = (value) => {
    setName(value)
    if (error) setError('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurations Management"
        description="Register and edit fertilizer and item names used across supplier requests."
      />

      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg" style={themedAccent.button}>
            <Check size={16} />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {loadError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/15 dark:text-red-300">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Configuration data could not be synchronized</p>
              <p className="text-xs opacity-80">{loadError}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshConfigurations}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 rounded-lg bg-slate-100 dark:bg-slate-900 p-1 w-fit">
            {Object.entries(configMeta).map(([key, item]) => {
              const Icon = item.icon
              const isActive = tab === key
              const list = key === 'fertilizer' ? fertilizerList : itemList

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors hover:bg-white dark:hover:bg-slate-800"
                  style={isActive ? themedAccent.button : { color: 'var(--theme-textSecondary)' }}
                >
                  <Icon size={15} />
                  {item.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {list.length}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
              <TypeIcon size={17} />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{meta.plural}</p>
              <p className="text-xs">{items.length} registered names</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{meta.plural}</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 text-center text-slate-400">
                <RefreshCw size={24} className="mb-2 animate-spin opacity-50" />
                <p className="text-sm">Loading configurations from database...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={themedAccent.icon}>
                  <TypeIcon size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No names registered</p>
                <p className="text-xs text-slate-400 mt-1">Use the form to add your first {meta.label.toLowerCase()} name.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Name</th>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Status</th>
                      <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {items.map(item => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        style={editingId === item.id ? themedAccent.selected : undefined}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
                              <TypeIcon size={15} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                              <p className="text-xs text-slate-400">Registered {meta.label.toLowerCase()} name</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status || (item.isActive ? 'active' : 'inactive')} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleActiveChange(item)}
                              disabled={activeSavingId === item.id}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                item.isActive
                                  ? 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                                  : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-900/15'
                              }`}
                            >
                              {activeSavingId === item.id ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                              {item.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside id="configuration-form" className="bg-slate-50/70 dark:bg-slate-900/30 p-4">
            <div className="bg-white dark:bg-slate-800 border rounded-xl p-4 shadow-sm" style={themedAccent.border}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {editingId ? `Edit ${meta.label}` : `Register ${meta.label}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {editingId ? 'Update the selected name.' : `Add a new ${meta.label.toLowerCase()} name.`}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={themedAccent.icon}>
                  {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                    Name
                  </label>
                  <input
                    value={name}
                    onChange={event => handleNameChange(event.target.value)}
                    placeholder={meta.placeholder}
                    className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: 'var(--theme-border)',
                      '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
                    }}
                    autoFocus
                  />
                  {error && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <X size={14} />
                      Clear
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      ...themedAccent.button,
                      '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {editingId ? 'Update' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
