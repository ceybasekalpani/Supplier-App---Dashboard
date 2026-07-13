import { communicationsApi } from '../../../services/communicationsApi'
import { emptyNewsForm, emptyNotifForm, getTodayDate, isValidRegNo, isWithinDeleteWindow } from '../utils/communicationHelpers'

export function useCommunicationActions({
  newsForm, setNewsForm, notifForm, setNotifForm, active, setActive,
  editingNews, setEditingNews, editingNotif, setEditingNotif,
  saving, setSaving, setDeletingKey, setNewsItems, setNotifications,
  selectedNewsIds, setSelectedNewsIds, selectedNotifIds, setSelectedNotifIds,
  canCreateNews, canUpdateNews, canDeleteNews, canCreateNotif, canUpdateNotif, canDeleteNotif,
  showToast, handleDiscard,
}) {
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

  const handleBulkDeleteNews = async () => {
    if (selectedNewsIds.length === 0) return

    if (!window.confirm(`Delete ${selectedNewsIds.length} selected news item(s)? This cannot be undone.`)) return

    setDeletingKey('news-bulk')

    const results = await Promise.allSettled(selectedNewsIds.map(id => communicationsApi.deleteNews(id)))
    const deletedIds = selectedNewsIds.filter((id, index) => results[index].status === 'fulfilled')
    const failedCount = results.length - deletedIds.length

    setNewsItems(prev => prev.filter(item => !deletedIds.includes(item.id)))
    setSelectedNewsIds([])
    setDeletingKey('')

    if (failedCount > 0) {
      showToast(`Deleted ${deletedIds.length} news item(s), ${failedCount} failed.`, deletedIds.length ? 'success' : 'error')
    } else {
      showToast(`Deleted ${deletedIds.length} news item(s) successfully.`)
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

  const handleBulkDeleteNotifications = async () => {
    if (selectedNotifIds.length === 0) return

    if (!window.confirm(`Delete ${selectedNotifIds.length} selected notification(s)? This cannot be undone.`)) return

    setDeletingKey('notification-bulk')

    const results = await Promise.allSettled(selectedNotifIds.map(id => communicationsApi.deleteNotification(id)))
    const deletedIds = selectedNotifIds.filter((id, index) => results[index].status === 'fulfilled')
    const failedCount = results.length - deletedIds.length

    setNotifications(prev => prev.filter(item => !deletedIds.includes(item.id)))
    setSelectedNotifIds([])
    setDeletingKey('')

    if (failedCount > 0) {
      showToast(`Deleted ${deletedIds.length} notification(s), ${failedCount} failed.`, deletedIds.length ? 'success' : 'error')
    } else {
      showToast(`Deleted ${deletedIds.length} notification(s) successfully.`)
    }
  }

  return {
    reloadCommunications,
    handleCreateNews, handleEditNews, handleUpdateNews, handleDeleteNews, handleBulkDeleteNews,
    handleSendNotification, handleEditNotif, handleUpdateNotif, handleDeleteNotif, handleBulkDeleteNotifications,
  }
}
