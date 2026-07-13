import { useEffect, useState } from 'react'
import { communicationsApi } from '../../../services/communicationsApi'
import { supplierDashboardApi } from '../../../services/supplierDashboardApi'
import { hasAdminPermission } from '../../../services/adminPermissions'
import { useCurrentAdmin } from '../../../hooks/useCurrentAdmin'
import { emptyNewsForm, emptyNotifForm, isWithinDeleteWindow, tabs } from '../utils/communicationHelpers'
import { useCommunicationActions } from './useCommunicationActions'

export function useCommunicationData() {
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
  const [selectedNewsIds, setSelectedNewsIds] = useState([])
  const [selectedNotifIds, setSelectedNotifIds] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [routeOptions, setRouteOptions] = useState([])
  const currentAdmin = useCurrentAdmin()

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

  const isNewsDeletable = (item) => canDeleteNews && isWithinDeleteWindow(item)
  const isNotifDeletable = (item) => canDeleteNotif && isWithinDeleteWindow(item)

  const deletableNews = filteredNews.filter(isNewsDeletable)
  const deletableNotifications = filteredNotifications.filter(isNotifDeletable)
  const allNewsSelected = deletableNews.length > 0 && deletableNews.every(item => selectedNewsIds.includes(item.id))
  const allNotifsSelected = deletableNotifications.length > 0 && deletableNotifications.every(item => selectedNotifIds.includes(item.id))

  const toggleNewsSelection = (id) => {
    setSelectedNewsIds(previous => (
      previous.includes(id) ? previous.filter(itemId => itemId !== id) : [...previous, id]
    ))
  }

  const toggleNotifSelection = (id) => {
    setSelectedNotifIds(previous => (
      previous.includes(id) ? previous.filter(itemId => itemId !== id) : [...previous, id]
    ))
  }

  const toggleSelectAllNews = () => {
    setSelectedNewsIds(allNewsSelected ? [] : deletableNews.map(item => item.id))
  }

  const toggleSelectAllNotifs = () => {
    setSelectedNotifIds(allNotifsSelected ? [] : deletableNotifications.map(item => item.id))
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const controller = new AbortController()

    communicationsApi
      .getAll({ signal: controller.signal })
      .then(result => {
        setNewsItems(result.news || [])
        setNotifications(result.notifications || [])
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

  const handleNewsFilterChange = (filter) => {
    setNewsFilter(filter)
    setSelectedNewsIds([])
  }

  const handleNotifFilterChange = (filter) => {
    setNotifFilter(filter)
    setSelectedNotifIds([])
  }

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
    setSelectedNewsIds([])
    setSelectedNotifIds([])
  }

  const refreshCommunications = () => {
    setLoading(true)
    setRefreshKey(current => current + 1)
  }

  const actions = useCommunicationActions({
    newsForm, setNewsForm, notifForm, setNotifForm, active, setActive,
    editingNews, setEditingNews, editingNotif, setEditingNotif,
    saving, setSaving, setDeletingKey, setNewsItems, setNotifications,
    selectedNewsIds, setSelectedNewsIds, selectedNotifIds, setSelectedNotifIds,
    canCreateNews, canUpdateNews, canDeleteNews, canCreateNotif, canUpdateNotif, canDeleteNotif,
    showToast, handleDiscard,
  })

  return {
    tab, newsFilter, notifFilter, active, editingNews, editingNotif,
    newsForm, notifForm, loading, saving, deletingKey, toast, routeOptions,
    filteredNews, filteredNotifications, ActiveTabIcon,
    canCreateNews, canUpdateNews, canDeleteNews, canCreateNotif, canUpdateNotif, canDeleteNotif,
    selectedNewsIds, selectedNotifIds, allNewsSelected, allNotifsSelected,
    deletableNews, deletableNotifications, newsItems, notifications,
    setActive, setNewsForm, setNotifForm,
    toggleNewsSelection, toggleNotifSelection, toggleSelectAllNews, toggleSelectAllNotifs,
    handleNewsFilterChange, handleNotifFilterChange,
    handleDiscard, handleTabChange, refreshCommunications,
    ...actions,
  }
}
