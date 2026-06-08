import { useState } from 'react'
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
  Send,
  Trash2,
  X,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import Toggle from '../components/ui/Toggle'
import { newsItems as initialNewsItems, notifications as initialNotifications } from '../data/mockData'

const tabs = [
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const newsFilters = ['all', 'active', 'draft', 'expired']
const notificationFilters = ['all', 'scheduled', 'delivered', 'failed']

const statusTone = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40',
  expired: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40',
  all: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
}

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

function FilterButton({ filter, activeFilter, count, onClick }) {
  const isActive = filter === activeFilter
  const themedStatuses = ['active', 'scheduled', 'delivered']

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
        isActive && !themedStatuses.includes(filter) ? statusTone[filter] : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      style={isActive && themedStatuses.includes(filter) ? themedPrimarySoft : undefined}
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

function NotificationStatus({ status }) {
  const usePrimary = status === 'scheduled' || status === 'delivered'

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold capitalize ${usePrimary ? '' : statusTone[status] || statusTone.all}`}
      style={usePrimary ? themedPrimarySoft : undefined}
    >
      {status}
    </span>
  )
}

export default function Communication() {
  const [tab, setTab] = useState('news')
  const [newsFilter, setNewsFilter] = useState('all')
  const [notifFilter, setNotifFilter] = useState('all')
  const [active, setActive] = useState(true)
  const [newsItems, setNewsItems] = useState(initialNewsItems)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [newsForm, setNewsForm] = useState({ title: '', description: '', expiryDate: '' })
  const [notifForm, setNotifForm] = useState({ title: '', message: '', schedule: '' })
  const [editingNews, setEditingNews] = useState(null)
  const [editingNotif, setEditingNotif] = useState(null)
  const [toast, setToast] = useState(null)

  const filteredNews = newsItems.filter(item => newsFilter === 'all' || item.status === newsFilter)
  const filteredNotifications = notifications.filter(item => notifFilter === 'all' || item.status === notifFilter)
  const activeTab = tabs.find(item => item.id === tab)
  const ActiveTabIcon = activeTab.icon

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const simulateSendNotification = () => (Math.random() < 0.9 ? 'delivered' : 'failed')

  const handleDiscard = () => {
    setEditingNews(null)
    setEditingNotif(null)
    setNewsForm({ title: '', description: '', expiryDate: '' })
    setNotifForm({ title: '', message: '', schedule: '' })
    setActive(true)
  }

  const handleTabChange = (nextTab) => {
    setTab(nextTab)
    handleDiscard()
  }

  const handleCreateNews = () => {
    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past.', 'error')
      return
    }

    const newNews = {
      id: Date.now(),
      title: newsForm.title.trim(),
      description: newsForm.description.trim(),
      created: getTodayDate(),
      expiry: newsForm.expiryDate || 'No expiry',
      status: active ? 'active' : 'draft',
    }

    setNewsItems(prev => [newNews, ...prev])
    setNewsForm({ title: '', description: '', expiryDate: '' })
    setActive(true)
    showToast('News created successfully.')
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
    })
    setActive(news.status === 'active')
  }

  const handleUpdateNews = () => {
    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past.', 'error')
      return
    }

    setNewsItems(prev => prev.map(item =>
      item.id === editingNews.id
        ? {
            ...item,
            title: newsForm.title.trim(),
            description: newsForm.description.trim(),
            expiry: newsForm.expiryDate || 'No expiry',
            status: active ? 'active' : 'draft',
          }
        : item
    ))

    handleDiscard()
    showToast('News updated successfully.')
  }

  const handleDeleteNews = (id, status) => {
    const message = status === 'expired'
      ? 'This news is expired. Do you still want to delete it?'
      : 'Are you sure you want to delete this news?'

    if (window.confirm(message)) {
      setNewsItems(prev => prev.filter(item => item.id !== id))
      showToast(status === 'expired' ? 'Expired news deleted.' : 'News deleted successfully.')
    }
  }

  const handleSendNotification = () => {
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

    const deliveryStatus = simulateSendNotification()
    const scheduledDateTime = notifForm.schedule
      ? new Date(notifForm.schedule).toLocaleString()
      : new Date().toLocaleString()

    const newNotif = {
      id: Date.now(),
      title: notifForm.title.trim(),
      message: notifForm.message.trim(),
      status: notifForm.schedule ? 'scheduled' : deliveryStatus,
      scheduledFor: scheduledDateTime,
      sentAt: !notifForm.schedule ? new Date().toLocaleString() : null,
    }

    setNotifications(prev => [newNotif, ...prev])
    setNotifForm({ title: '', message: '', schedule: '' })
    showToast(
      notifForm.schedule
        ? 'Notification scheduled successfully.'
        : `Notification ${deliveryStatus === 'delivered' ? 'sent successfully.' : 'failed to send. Please try again.'}`,
      deliveryStatus === 'delivered' || notifForm.schedule ? 'success' : 'error'
    )
  }

  const handleEditNotif = (notif) => {
    setEditingNotif(notif)
    setNotifForm({ title: notif.title, message: notif.message, schedule: '' })
  }

  const handleUpdateNotif = () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please fill in title and message.', 'error')
      return
    }

    setNotifications(prev => prev.map(item =>
      item.id === editingNotif.id
        ? { ...item, title: notifForm.title.trim(), message: notifForm.message.trim() }
        : item
    ))

    handleDiscard()
    showToast('Notification updated successfully.')
  }

  const handleDeleteNotif = (id, status) => {
    const message = status === 'failed'
      ? 'This notification failed. Do you still want to delete it?'
      : 'Are you sure you want to delete this notification?'

    if (window.confirm(message)) {
      setNotifications(prev => prev.filter(item => item.id !== id))
      showToast(status === 'failed' ? 'Failed notification deleted.' : 'Notification deleted successfully.')
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
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.title}</td>
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
                              disabled={item.status === 'expired'}
                              className={`rounded-lg border p-1.5 transition-colors ${
                                item.status === 'expired'
                                  ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item.id, item.status)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={13} />
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
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.title}</td>
                        <td className="max-w-80 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="line-clamp-2">{item.message}</span>
                        </td>
                        <td className="px-4 py-3"><NotificationStatus status={item.status} /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.scheduledFor || item.sentAt || 'Immediate'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditNotif(item)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNotif(item.id, item.status)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={13} />
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
                  <Toggle checked={active} onChange={event => setActive(event.target.checked)} label="Active News" />

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
                      className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors"
                      style={themedPrimary}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Check size={14} />
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
                      className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors"
                      style={themedPrimary}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Send size={14} />
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
