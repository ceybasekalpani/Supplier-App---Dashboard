import { useEffect, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  Edit3,
  Megaphone,
  MessageSquare,
  Newspaper,
  Pencil,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge, { getStatusPalette } from '../components/ui/StatusBadge'
import { useTheme } from '../context/useTheme'
import Toggle from '../components/ui/Toggle'
import { communicationsApi } from '../services/communicationsApi'
import { supplierDashboardApi } from '../services/supplierDashboardApi'
import Combobox from '../components/ui/Combobox'
import { adminAuthStorage } from '../services/adminApiClient'
import { hasAdminPermission } from '../services/adminPermissions'
import { dashboardPermissionsApi } from '../services/dashboardPermissionsApi'

const tabs = [
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const audienceOptions = [
  { value: 'AllSuppliers', label: 'All suppliers' },
  { value: 'Route', label: 'Route wise' },
  { value: 'SpecificSupplier', label: 'Specific supplier' },
]

const notificationTypeOptions = [
  { value: 'General', label: 'General' },
  { value: 'News', label: 'News' },
  { value: 'Request', label: 'Request' },
  { value: 'Fertilizer', label: 'Fertilizer' },
  { value: 'Item', label: 'Item' },
]

const newsFilters = ['all', 'active', 'draft', 'expired']
const notificationFilters = ['all', 'scheduled', 'delivered', 'failed']

const themedPrimary = {
  backgroundColor: 'var(--theme-primary)',
  color: 'var(--theme-white)',
}

const themedPrimarySoft = {
  backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
  borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
  color: 'var(--theme-primary)',
}

const themedPrimaryBorder = {
  borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
}

const themedInput = {
  borderColor: 'var(--theme-border)',
  '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function countStatus(items, status) {
  return status === 'all' ? items.length : items.filter(item => item.status === status).length
}

const isValidRegNo = value => /^\d+$/.test(String(value || '').trim())

const emptyNewsForm = () => ({ title: '', description: '', expiryDate: '', audienceType: 'AllSuppliers', targetRegNo: '', targetRoute: '' })

const emptyNotifForm = () => ({ title: '', message: '', schedule: '', type: 'General', audienceType: 'AllSuppliers', targetRegNo: '', targetRoute: '' })

const getAudienceLabel = (item) => {
  if (item.audienceType === 'SpecificSupplier') return `Supplier ${item.targetRegNo || '-'}`
  if (item.audienceType === 'Route') return `Route ${item.targetRoute || '-'}`
  return 'All suppliers'
}

const isWithinDeleteWindow = (item) => {
  const sourceDate = item.createdAt || item.created || item.sentAt || item.scheduledFor
  const createdTime = new Date(sourceDate).getTime()

  if (!sourceDate || Number.isNaN(createdTime)) return false

  return Date.now() - createdTime <= 24 * 60 * 60 * 1000
}

function FilterButton({ filter, activeFilter, count, onClick }) {
  const isActive = filter === activeFilter
  const { dark } = useTheme()
  const palette = filter === 'all'
    ? dark
      ? { background: '#1E293B', border: '#475569', text: '#CBD5E1' }
      : { background: '#F1F5F9', border: '#CBD5E1', text: '#475569' }
    : getStatusPalette(filter, dark)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
        isActive ? '' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      style={isActive ? {
        backgroundColor: palette.background,
        borderColor: palette.border,
        color: palette.text,
      } : undefined}
    >
      {filter}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/50 dark:bg-slate-900/30' : 'bg-slate-100 dark:bg-slate-900'}`}>
        {count}
      </span>
    </button>
  )
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-700">
        <Icon size={24} />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  )
}

export default function Communication() {
  const [tab, setTab] = useState('news')
  const [newsFilter, setNewsFilter] = useState('all')
  const [notifFilter, setNotifFilter] = useState('all')
  const [active, setActive] = useState(true)
  const [newsItems, setNewsItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [newsForm, setNewsForm] = useState(emptyNewsForm)
  const [notifForm, setNotifForm] = useState(emptyNotifForm)
  const [editingNews, setEditingNews] = useState(null)
  const [editingNotif, setEditingNotif] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingKey, setDeletingKey] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [routeOptions, setRouteOptions] = useState([])
  const [currentAdmin, setCurrentAdmin] = useState(() => adminAuthStorage.getUser())

  const filteredNews = newsItems.filter(item => newsFilter === 'all' || item.status === newsFilter)
  const filteredNotifications = notifications.filter(item => notifFilter === 'all' || item.status === notifFilter)
  const activeTab = tabs.find(item => item.id === tab)
  const ActiveTabIcon = activeTab.icon

  const canCreateNews = hasAdminPermission(currentAdmin, ['news.create'])
  const canUpdateNews = hasAdminPermission(currentAdmin, ['news.update'])
  const canDeleteNews = hasAdminPermission(currentAdmin, ['news.delete'])
  const canCreateNotif = hasAdminPermission(currentAdmin, ['notifications.create'])
  const canUpdateNotif = hasAdminPermission(currentAdmin, ['notifications.update'])
  const canDeleteNotif = hasAdminPermission(currentAdmin, ['notifications.delete'])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const admin = adminAuthStorage.getUser()
    if (!admin?.id || admin.isSuperAdmin) {
      return
    }

    let mounted = true
    dashboardPermissionsApi
      .getUserPermissions(admin.id)
      .then(permissions => {
        if (!mounted) return
        const updatedAdmin = {
          ...admin,
          hasPermissionData: true,
          modulePermissions: permissions.modulePermissions || {},
          subPermissions: permissions.subPermissions || {},
        }
        adminAuthStorage.setUser(updatedAdmin)
        setCurrentAdmin(updatedAdmin)
      })
      .catch(() => {
        if (mounted) setCurrentAdmin(admin)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    communicationsApi
      .getAll({ signal: controller.signal })
      .then(result => {
        setNewsItems(result.news)
        setNotifications(result.notifications)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          showToast(error.message || 'Unable to load communication records.', 'error')
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [refreshKey])

  useEffect(() => {
    const controller = new AbortController()

    supplierDashboardApi
      .listSuppliers({
        search: '',
        months: 1,
        activeOnly: false,
        signal: controller.signal,
      })
      .then(response => {
        const routes = Array.from(new Set(
          (response.suppliers || [])
            .map(supplier => supplier.route)
            .filter(Boolean)
        )).sort()

        setRouteOptions(routes.map(route => ({ value: route, label: route })))
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          showToast(error.message || 'Unable to load supplier routes.', 'error')
        }
      })

    return () => controller.abort()
  }, [])

  const handleDiscard = () => {
    setEditingNews(null)
    setEditingNotif(null)
    setNewsForm(emptyNewsForm())
    setNotifForm(emptyNotifForm())
    setActive(true)
  }

  const handleTabChange = (nextTab) => {
    setTab(nextTab)
    handleDiscard()
  }

  const refreshCommunications = () => {
    setLoading(true)
    setRefreshKey(current => current + 1)
  }

  const reloadCommunications = async () => {
    const result = await communicationsApi.getAll()
    setNewsItems(result.news)
    setNotifications(result.notifications)
  }

  const handleCreateNews = async () => {
    if (saving) return

    if (!canCreateNews) {
      showToast('You do not have permission to create news.', 'error')
      return
    }

    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past.', 'error')
      return
    }

    if (newsForm.audienceType === 'SpecificSupplier' && !isValidRegNo(newsForm.targetRegNo)) {
      showToast('A valid numeric supplier registration number is required.', 'error')
      return
    }

    if (newsForm.audienceType === 'Route' && !newsForm.targetRoute.trim()) {
      showToast('Route is required for route-wise news.', 'error')
      return
    }

    setSaving(true)

    try {
      await communicationsApi.createNews({ ...newsForm, active })
      await reloadCommunications()
      setNewsForm(emptyNewsForm())
      setActive(true)
      showToast(active ? 'News published successfully.' : 'News saved as draft.')
    } catch (error) {
      showToast(error.message || 'Unable to create news.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEditNews = (news) => {
    if (news.status === 'expired') {
      showToast('Cannot edit expired news.', 'error')
      return
    }

    setEditingNews(news)
    setNewsForm({
      title: news.title,
      description: news.description,
      expiryDate: news.expiry !== 'No expiry' ? news.expiry : '',
      audienceType: news.audienceType || 'AllSuppliers',
      targetRegNo: news.targetRegNo || '',
      targetRoute: news.targetRoute || '',
    })
    setActive(news.status === 'active')
  }

  const handleUpdateNews = async () => {
    if (saving || !editingNews) return

    if (!canUpdateNews) {
      showToast('You do not have permission to update news.', 'error')
      return
    }

    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past.', 'error')
      return
    }

    if (newsForm.audienceType === 'SpecificSupplier' && !isValidRegNo(newsForm.targetRegNo)) {
      showToast('A valid numeric supplier registration number is required.', 'error')
      return
    }

    if (newsForm.audienceType === 'Route' && !newsForm.targetRoute.trim()) {
      showToast('Route is required for route-wise news.', 'error')
      return
    }

    setSaving(true)

    try {
      await communicationsApi.updateNews(editingNews.id, { ...newsForm, active })
      await reloadCommunications()

      handleDiscard()
      showToast('News updated successfully.')
    } catch (error) {
      showToast(error.message || 'Unable to update news.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNews = async (item) => {
    if (!canDeleteNews) {
      showToast('You do not have permission to delete news.', 'error')
      return
    }

    if (!isWithinDeleteWindow(item)) {
      showToast('News can be deleted only within 24 hours after creation.', 'error')
      return
    }

    const message = item.status === 'expired'
      ? 'This news is expired. Do you still want to delete it?'
      : 'Are you sure you want to delete this news?'

    if (window.confirm(message)) {
      const { id, status } = item
      const deleteKey = `news-${id}`
      setDeletingKey(deleteKey)

      try {
        await communicationsApi.deleteNews(id)
        setNewsItems(prev => prev.filter(item => item.id !== id))
        showToast(status === 'expired' ? 'Expired news deleted.' : 'News deleted successfully.')
      } catch (error) {
        showToast(error.message || 'Unable to delete news.', 'error')
      } finally {
        setDeletingKey('')
      }
    }
  }

  const handleSendNotification = async () => {
    if (saving) return

    if (!canCreateNotif) {
      showToast('You do not have permission to send notifications.', 'error')
      return
    }

    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please fill in title and message.', 'error')
      return
    }

    if (notifForm.schedule) {
      const scheduleDate = new Date(notifForm.schedule)
      if (scheduleDate < new Date()) {
        showToast('Schedule date cannot be in the past.', 'error')
        return
      }
    }

    if (notifForm.audienceType === 'SpecificSupplier' && !isValidRegNo(notifForm.targetRegNo)) {
      showToast('A valid numeric supplier registration number is required.', 'error')
      return
    }

    if (notifForm.audienceType === 'Route' && !notifForm.targetRoute.trim()) {
      showToast('Route is required for route-wise notifications.', 'error')
      return
    }

    setSaving(true)

    try {
      await communicationsApi.createNotification(notifForm)
      await reloadCommunications()
      setNotifForm(emptyNotifForm())
      showToast(notifForm.schedule ? 'Notification scheduled successfully.' : 'Notification sent successfully.')
    } catch (error) {
      showToast(error.message || 'Unable to send notification.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEditNotif = (notif) => {
    setEditingNotif(notif)
    setNotifForm({
      title: notif.title,
      message: notif.message,
      schedule: notif.scheduledFor ? String(notif.scheduledFor).slice(0, 16) : '',
      type: notif.type || 'General',
      audienceType: notif.audienceType || 'AllSuppliers',
      targetRegNo: notif.targetRegNo || '',
      targetRoute: notif.targetRoute || '',
    })
  }

  const handleUpdateNotif = async () => {
    if (saving || !editingNotif) return

    if (!canUpdateNotif) {
      showToast('You do not have permission to update notifications.', 'error')
      return
    }

    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please fill in title and message.', 'error')
      return
    }

    if (notifForm.audienceType === 'SpecificSupplier' && !isValidRegNo(notifForm.targetRegNo)) {
      showToast('A valid numeric supplier registration number is required.', 'error')
      return
    }

    if (notifForm.audienceType === 'Route' && !notifForm.targetRoute.trim()) {
      showToast('Route is required for route-wise notifications.', 'error')
      return
    }

    setSaving(true)

    try {
      await communicationsApi.updateNotification(editingNotif.id, notifForm)
      await reloadCommunications()

      handleDiscard()
      showToast('Notification updated successfully.')
    } catch (error) {
      showToast(error.message || 'Unable to update notification.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNotif = async (item) => {
    if (!canDeleteNotif) {
      showToast('You do not have permission to delete notifications.', 'error')
      return
    }

    if (!isWithinDeleteWindow(item)) {
      showToast('Notifications can be deleted only within 24 hours after creation.', 'error')
      return
    }

    const message = item.status === 'failed'
      ? 'This notification failed. Do you still want to delete it?'
      : 'Are you sure you want to delete this notification?'

    if (window.confirm(message)) {
      const { id, status } = item
      const deleteKey = `notification-${id}`
      setDeletingKey(deleteKey)

      try {
        await communicationsApi.deleteNotification(id)
        setNotifications(prev => prev.filter(item => item.id !== id))
        showToast(status === 'failed' ? 'Failed notification deleted.' : 'Notification deleted successfully.')
      } catch (error) {
        showToast(error.message || 'Unable to delete notification.', 'error')
      } finally {
        setDeletingKey('')
      }
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
          toast.type === 'error' ? 'bg-red-600' : ''
        }`} style={toast.type === 'error' ? undefined : themedPrimary}>
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Communication Center"
        description="Manage supplier news updates and direct notifications."
        badge="Supplier communication"
        icon={Megaphone}
      />

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading communication records...
          </span>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            {tabs.map(item => {
              const Icon = item.icon
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
                  style={isActive ? themedPrimary : { color: 'var(--theme-textSecondary)' }}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={refreshCommunications}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {(tab === 'news' ? newsFilters : notificationFilters).map(filter => (
              <FilterButton
                key={filter}
                filter={filter}
                activeFilter={tab === 'news' ? newsFilter : notifFilter}
                count={countStatus(tab === 'news' ? newsItems : notifications, filter)}
                onClick={() => tab === 'news' ? setNewsFilter(filter) : setNotifFilter(filter)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <ActiveTabIcon size={17} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {tab === 'news' ? 'News Board' : 'Notification Queue'}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {(tab === 'news' ? filteredNews : filteredNotifications).length} records
              </span>
            </div>

            {tab === 'news' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-y border-slate-200 bg-white text-xs uppercase text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Message</th>
                      <th className="px-4 py-3 text-left font-semibold">Created</th>
                      <th className="px-4 py-3 text-left font-semibold">Expiry</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredNews.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {getAudienceLabel(item)}
                          </p>
                        </td>
                        <td className="max-w-72 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="line-clamp-2">{item.description}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.created}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.expiry}</td>
                        <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditNews(item)}
                              disabled={item.status === 'expired' || !canUpdateNews}
                              className={`rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                item.status === 'expired'
                                  ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item)}
                              disabled={deletingKey === `news-${item.id}` || !isWithinDeleteWindow(item) || !canDeleteNews}
                              title={isWithinDeleteWindow(item) ? 'Delete news' : 'Delete allowed only within 24 hours'}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-900/20"
                            >
                              {deletingKey === `news-${item.id}` ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredNews.length === 0 && (
                      <tr>
                        <td colSpan="6">
                          <EmptyState icon={Newspaper} title="No news found" description="Try another status filter or create a new news item." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-y border-slate-200 bg-white text-xs uppercase text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Message</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                      <th className="px-4 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredNotifications.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {item.type || 'General'} / {getAudienceLabel(item)}
                          </p>
                        </td>
                        <td className="max-w-80 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="line-clamp-2">{item.message}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={item.status} className="px-2 py-1" /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.scheduledFor || item.sentAt || 'Immediate'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditNotif(item)}
                              disabled={!canUpdateNotif}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNotif(item)}
                              disabled={deletingKey === `notification-${item.id}` || !isWithinDeleteWindow(item) || !canDeleteNotif}
                              title={isWithinDeleteWindow(item) ? 'Delete notification' : 'Delete allowed only within 24 hours'}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-900/20"
                            >
                              {deletingKey === `notification-${item.id}` ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredNotifications.length === 0 && (
                      <tr>
                        <td colSpan="5">
                          <EmptyState icon={Bell} title="No notifications found" description="Try another status filter or send a new notification." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="bg-slate-50/70 p-4 dark:bg-slate-900/30">
            {tab === 'news' ? (
              <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800" style={themedPrimaryBorder}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{editingNews ? 'Edit News' : 'Create News'}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Publish supplier notice board updates.</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={themedPrimarySoft}>
                    {editingNews ? <Edit3 size={16} /> : <Newspaper size={16} />}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">News Title</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={event => setNewsForm({ ...newsForm, title: event.target.value })}
                      placeholder="Enter title..."
                      className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                      style={themedInput}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Message Content</label>
                    <textarea
                      rows={4}
                      value={newsForm.description}
                      onChange={event => setNewsForm({ ...newsForm, description: event.target.value })}
                      placeholder="Enter message..."
                      className="w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                      style={themedInput}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Expiry Date</label>
                    <div className="relative">
                      <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={newsForm.expiryDate}
                        onChange={event => setNewsForm({ ...newsForm, expiryDate: event.target.value })}
                        min={getTodayDate()}
                        className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                        style={themedInput}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Audience</label>
                    <Combobox
                      value={newsForm.audienceType}
                      onChange={value => setNewsForm({
                        ...newsForm,
                        audienceType: value,
                        targetRegNo: value === 'SpecificSupplier' ? newsForm.targetRegNo : '',
                        targetRoute: value === 'Route' ? newsForm.targetRoute : '',
                      })}
                      options={audienceOptions}
                      buttonClassName="py-2.5 dark:bg-slate-900"
                      style={themedInput}
                    />
                  </div>
                  {newsForm.audienceType === 'SpecificSupplier' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Supplier Reg No</label>
                      <input
                        type="text"
                        value={newsForm.targetRegNo}
                        onChange={event => setNewsForm({ ...newsForm, targetRegNo: event.target.value })}
                        inputMode="numeric"
                        placeholder="Enter supplier registration number"
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                        style={themedInput}
                      />
                    </div>
                  )}
                  {newsForm.audienceType === 'Route' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Route</label>
                      <Combobox
                        value={newsForm.targetRoute}
                        onChange={value => setNewsForm({ ...newsForm, targetRoute: value })}
                        options={routeOptions}
                        placeholder={routeOptions.length === 0 ? 'No routes available' : 'Select route'}
                        disabled={routeOptions.length === 0}
                        buttonClassName="py-2.5 dark:bg-slate-900"
                        style={themedInput}
                      />
                    </div>
                  )}
                  <Toggle checked={active} onChange={event => setActive(event.target.checked)} label="Publish now" />

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <X size={14} />
                        {editingNews ? 'Cancel' : 'Discard'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={editingNews ? handleUpdateNews : handleCreateNews}
                      disabled={saving || (editingNews ? !canUpdateNews : !canCreateNews)}
                      className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      style={themedPrimary}
                    >
                      <span className="inline-flex items-center gap-2">
                        {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        {editingNews ? 'Update' : 'Publish'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800" style={themedPrimaryBorder}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{editingNotif ? 'Edit Notification' : 'Send Notification'}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Send or schedule supplier messages.</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={themedPrimarySoft}>
                    {editingNotif ? <Edit3 size={16} /> : <MessageSquare size={16} />}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Title</label>
                    <input
                      type="text"
                      value={notifForm.title}
                      onChange={event => setNotifForm({ ...notifForm, title: event.target.value })}
                      placeholder="Enter title..."
                      className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                      style={themedInput}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Message</label>
                    <textarea
                      rows={4}
                      value={notifForm.message}
                      onChange={event => setNotifForm({ ...notifForm, message: event.target.value })}
                      placeholder="Enter message..."
                      className="w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                      style={themedInput}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Notification Type</label>
                    <Combobox
                      value={notifForm.type}
                      onChange={value => setNotifForm({ ...notifForm, type: value })}
                      options={notificationTypeOptions}
                      buttonClassName="py-2.5 dark:bg-slate-900"
                      style={themedInput}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Audience</label>
                    <Combobox
                      value={notifForm.audienceType}
                      onChange={value => setNotifForm({
                        ...notifForm,
                        audienceType: value,
                        targetRegNo: value === 'SpecificSupplier' ? notifForm.targetRegNo : '',
                        targetRoute: value === 'Route' ? notifForm.targetRoute : '',
                      })}
                      options={audienceOptions}
                      buttonClassName="py-2.5 dark:bg-slate-900"
                      style={themedInput}
                    />
                  </div>
                  {notifForm.audienceType === 'SpecificSupplier' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Supplier Reg No</label>
                      <input
                        type="text"
                        value={notifForm.targetRegNo}
                        onChange={event => setNotifForm({ ...notifForm, targetRegNo: event.target.value })}
                        inputMode="numeric"
                        placeholder="Enter supplier registration number"
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                        style={themedInput}
                      />
                    </div>
                  )}
                  {notifForm.audienceType === 'Route' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Route</label>
                      <Combobox
                        value={notifForm.targetRoute}
                        onChange={value => setNotifForm({ ...notifForm, targetRoute: value })}
                        options={routeOptions}
                        placeholder={routeOptions.length === 0 ? 'No routes available' : 'Select route'}
                        disabled={routeOptions.length === 0}
                        buttonClassName="py-2.5 dark:bg-slate-900"
                        style={themedInput}
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Schedule</label>
                    <div className="relative">
                      <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={notifForm.schedule}
                        onChange={event => setNotifForm({ ...notifForm, schedule: event.target.value })}
                        min={getCurrentDateTime()}
                        className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
                        style={themedInput}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <X size={14} />
                        {editingNotif ? 'Cancel' : 'Discard'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={editingNotif ? handleUpdateNotif : handleSendNotification}
                      disabled={saving || (editingNotif ? !canUpdateNotif : !canCreateNotif)}
                      className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      style={themedPrimary}
                    >
                      <span className="inline-flex items-center gap-2">
                        {saving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                        {editingNotif ? 'Update' : 'Send'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
