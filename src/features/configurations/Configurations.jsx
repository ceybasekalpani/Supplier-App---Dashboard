import { useEffect, useState } from 'react'
import { Check, Info, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { fertilizerItemConfigurationsApi } from '../../services/fertilizerItemConfigurationsApi'
import { hasAdminPermission } from '../../services/adminPermissions'
import { useCurrentAdmin } from '../../hooks/useCurrentAdmin'
import { configMeta, configModules, themedAccent } from './utils/configurationConstants'
import SalaryDateCard from './components/SalaryDateCard'
import ConfigurationTabs from './components/ConfigurationTabs'
import ConfigurationList from './components/ConfigurationList'
import ConfigurationForm from './components/ConfigurationForm'

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
  const currentAdmin = useCurrentAdmin()

  const meta = configMeta[tab]
  const items = tab === 'fertilizer' ? fertilizerList : itemList
  const configModule = configModules[tab]
  const canCreate = hasAdminPermission(currentAdmin, [`${configModule}.create`])
  const canUpdate = hasAdminPermission(currentAdmin, [`${configModule}.update`])
  const canUpdateSalaryDate = hasAdminPermission(currentAdmin, ['settings.update'])

  useEffect(() => {
    const controller = new AbortController()

    fertilizerItemConfigurationsApi
      .list({ includeInactive: true, signal: controller.signal })
      .then(result => {
        setFertilizerList(result.fertilizer || [])
        setItemList(result.items || [])
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

    if (editingId ? !canUpdate : !canCreate) {
      setError(`You do not have permission to ${editingId ? 'update' : 'create'} ${meta.label.toLowerCase()} names.`)
      return
    }

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

    if (!canUpdate) {
      setLoadError(`You do not have permission to update ${meta.label.toLowerCase()} names.`)
      return
    }

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

      <SalaryDateCard canUpdateSalaryDate={canUpdateSalaryDate} />

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
            <Info size={16} className="mt-0.5 shrink-0" />
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
        <ConfigurationTabs
          tab={tab}
          onTabChange={switchTab}
          fertilizerList={fertilizerList}
          itemList={itemList}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
          <ConfigurationList
            tab={tab}
            items={items}
            loading={loading}
            editingId={editingId}
            activeSavingId={activeSavingId}
            canUpdate={canUpdate}
            onActiveChange={handleActiveChange}
            onEdit={handleEdit}
          />

          <ConfigurationForm
            tab={tab}
            name={name}
            onNameChange={handleNameChange}
            editingId={editingId}
            error={error}
            saving={saving}
            canCreate={canCreate}
            canUpdate={canUpdate}
            onSave={handleSave}
            onReset={resetForm}
          />
        </div>
      </section>
    </div>
  )
}
