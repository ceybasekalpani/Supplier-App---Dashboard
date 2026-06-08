import { useState } from 'react'
import { Pencil, Trash2, Send } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Toggle from '../components/ui/Toggle'
import { newsItems as initialNewsItems, notifications as initialNotifications } from '../data/mockData'

export default function Communication() {
  const [tab, setTab] = useState('news')
  const [newsFilter, setNewsFilter] = useState('all')
  const [notifFilter, setNotifFilter] = useState('all')
  const [active, setActive] = useState(true)
  const [newsItems, setNewsItems] = useState(initialNewsItems)
  const [notifications, setNotifications] = useState(initialNotifications)
  
  // Form states for news
  const [newsForm, setNewsForm] = useState({
    title: '',
    description: '',
    expiryDate: ''
  })
  
  // Form states for notifications
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    schedule: ''
  })
  
  // Edit states
  const [editingNews, setEditingNews] = useState(null)
  const [editingNotif, setEditingNotif] = useState(null)
  
  // Toast/Alert state
  const [toast, setToast] = useState(null)
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  
  const filtered = newsItems.filter(n => newsFilter === 'all' || n.status === newsFilter)
  
  // Filter notifications based on status
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'all') return true
    return n.status === notifFilter
  })
  
  // Get today's date in YYYY-MM-DD format for min date attribute
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Get current datetime for datetime-local min attribute
  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  // Simulate sending notification with random success/failure
  const simulateSendNotification = () => {
    // 90% success rate for realistic behavior
    const isSuccess = Math.random() < 0.9
    return isSuccess ? 'delivered' : 'failed'
  }
  
  // News CRUD operations
  const handleCreateNews = () => {
    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    // Validate expiry date is not in the past
    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past', 'error')
      return
    }
    
    const newNews = {
      id: Date.now(),
      title: newsForm.title,
      description: newsForm.description,
      created: new Date().toLocaleDateString(),
      expiry: newsForm.expiryDate || 'No expiry',
      status: active ? 'active' : 'draft'
    }
    
    setNewsItems([newNews, ...newsItems])
    setNewsForm({ title: '', description: '', expiryDate: '' })
    setActive(true)
    showToast('News created successfully!', 'success')
  }
  
  const handleEditNews = (news) => {
    if (news.status === 'expired') {
      showToast('Cannot edit expired news', 'error')
      return
    }
    setEditingNews(news)
    setNewsForm({
      title: news.title,
      description: news.description,
      expiryDate: news.expiry !== 'No expiry' ? news.expiry : ''
    })
    setActive(news.status === 'active')
  }
  
  const handleUpdateNews = () => {
    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    // Validate expiry date is not in the past
    if (newsForm.expiryDate && newsForm.expiryDate < getTodayDate()) {
      showToast('Expiry date cannot be in the past', 'error')
      return
    }
    
    setNewsItems(newsItems.map(item => 
      item.id === editingNews.id 
        ? {
            ...item,
            title: newsForm.title,
            description: newsForm.description,
            expiry: newsForm.expiryDate || 'No expiry',
            status: active ? 'active' : 'draft'
          }
        : item
    ))
    
    setEditingNews(null)
    setNewsForm({ title: '', description: '', expiryDate: '' })
    setActive(true)
    showToast('News updated successfully!', 'success')
  }
  
  const handleDeleteNews = (id, status) => {
    if (status === 'expired') {
      if (window.confirm('This news is expired. Do you still want to delete it?')) {
        setNewsItems(newsItems.filter(item => item.id !== id))
        showToast('Expired news deleted', 'success')
      }
    } else if (window.confirm('Are you sure you want to delete this news?')) {
      setNewsItems(newsItems.filter(item => item.id !== id))
      showToast('News deleted successfully', 'success')
    }
  }
  
  // Notifications CRUD operations
  const handleSendNotification = () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please fill in title and message', 'error')
      return
    }
    
    // Validate schedule is not in the past for notifications
    if (notifForm.schedule) {
      const scheduleDate = new Date(notifForm.schedule)
      const now = new Date()
      if (scheduleDate < now) {
        showToast('Schedule date cannot be in the past', 'error')
        return
      }
    }
    
    // Simulate sending notification
    const deliveryStatus = simulateSendNotification()
    const scheduledDateTime = notifForm.schedule 
      ? new Date(notifForm.schedule).toLocaleString()
      : new Date().toLocaleString()
    
    const newNotif = {
      id: Date.now(),
      title: notifForm.title,
      message: notifForm.message,
      status: notifForm.schedule ? 'scheduled' : deliveryStatus,
      scheduledFor: scheduledDateTime,
      sentAt: !notifForm.schedule ? new Date().toLocaleString() : null
    }
    
    setNotifications([newNotif, ...notifications])
    setNotifForm({ title: '', message: '', schedule: '' })
    
    if (notifForm.schedule) {
      showToast('Notification scheduled successfully!', 'success')
    } else {
      showToast(`Notification ${deliveryStatus === 'delivered' ? 'sent successfully!' : 'failed to send. Please try again.'}`, 
        deliveryStatus === 'delivered' ? 'success' : 'error')
    }
  }
  
  const handleEditNotif = (notif) => {
    // Failed notifications can now be edited
    setEditingNotif(notif)
    setNotifForm({
      title: notif.title,
      message: notif.message,
      schedule: ''
    })
  }
  
  const handleUpdateNotif = () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please fill in title and message', 'error')
      return
    }
    
    setNotifications(notifications.map(item =>
      item.id === editingNotif.id
        ? {
            ...item,
            title: notifForm.title,
            message: notifForm.message
          }
        : item
    ))
    
    setEditingNotif(null)
    setNotifForm({ title: '', message: '', schedule: '' })
    showToast('Notification updated successfully!', 'success')
  }
  
  const handleDeleteNotif = (id, status) => {
    if (status === 'failed') {
      if (window.confirm('This notification failed. Do you still want to delete it?')) {
        setNotifications(notifications.filter(item => item.id !== id))
        showToast('Failed notification deleted', 'success')
      }
    } else if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(item => item.id !== id))
      showToast('Notification deleted successfully', 'success')
    }
  }
  
  const handleDiscard = () => {
    if (editingNews || editingNotif) {
      setEditingNews(null)
      setEditingNotif(null)
    }
    setNewsForm({ title: '', description: '', expiryDate: '' })
    setNotifForm({ title: '', message: '', schedule: '' })
    setActive(true)
  }
  
  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">News/Notification Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage news and notifications for suppliers</p>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-fit">
        {['news', 'notifications'].map(t => (
          <button key={t} onClick={() => {
            setTab(t)
            handleDiscard()
          }}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {['all', 'active', 'draft', 'expired'].map(f => (
              <button
                key={f}
                onClick={() => setNewsFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors
                  ${
                    newsFilter === f
                      ? f === 'all'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : f === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800'
                        : f === 'draft'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {['Title', 'Message', 'Created Date', 'Expired Date', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(n => (
                      <tr key={n.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 max-w-[140px] truncate">{n.title}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs max-w-40 truncate">{n.description}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{n.created}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{n.expiry}</td>
                        <td className="py-3 px-4"><StatusBadge status={n.status} /></td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditNews(n)}
                              disabled={n.status === 'expired'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                n.status === 'expired'
                                  ? 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-600 cursor-not-allowed opacity-50'
                                  : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                              title={n.status === 'expired' ? 'Cannot edit expired news' : 'Edit news'}>
                              <Pencil size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteNews(n.id, n.status)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400">
                          No news found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {editingNews ? 'Edit News' : 'Create News'}
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">News Title *</label>
                <input 
                  type="text" 
                  value={newsForm.title}
                  onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                  placeholder="Enter title…" 
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Message Content *</label>
                <textarea 
                  rows={3} 
                  value={newsForm.description}
                  onChange={e => setNewsForm({...newsForm, description: e.target.value})}
                  placeholder="Enter message…" 
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 resize-none" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Expiry Date</label>
                <input 
                  type="date" 
                  value={newsForm.expiryDate}
                  onChange={e => setNewsForm({...newsForm, expiryDate: e.target.value})}
                  min={getTodayDate()}
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" 
                />
                <p className="text-xs text-slate-400 mt-1">Cannot select past dates</p>
              </div>
              <Toggle checked={active} onChange={e => setActive(e.target.checked)} label="Active News" />
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleDiscard}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {editingNews ? 'Cancel' : 'Discard'}
                </button>
                <button 
                  onClick={editingNews ? handleUpdateNews : handleCreateNews}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                  {editingNews ? 'Update News' : 'Send News'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-3">
          {/* Notification Filter Section */}
          <div className="flex gap-2">
            {['all', 'scheduled', 'delivered', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setNotifFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors
                  ${
                    notifFilter === f
                      ? f === 'all'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : f === 'scheduled'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                        : f === 'delivered'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {['Title', 'Message', 'Status', 'Scheduled Date', 'Action'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.map(n => (
                      <tr key={n.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{n.title}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs max-w-[200px] truncate">{n.message}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            n.status === 'delivered' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : n.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{n.scheduledFor}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditNotif(n)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              title="Edit notification">
                              <Pencil size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteNotif(n.id, n.status)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredNotifications.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-400">
                          No notifications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {editingNotif ? 'Edit Notification' : 'Send Notification'}
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Title *</label>
                <input 
                  type="text" 
                  value={notifForm.title}
                  onChange={e => setNotifForm({...notifForm, title: e.target.value})}
                  placeholder="Enter title…" 
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Message *</label>
                <textarea 
                  rows={3} 
                  value={notifForm.message}
                  onChange={e => setNotifForm({...notifForm, message: e.target.value})}
                  placeholder="Enter message…" 
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400 resize-none" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Schedule (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={notifForm.schedule}
                  onChange={e => setNotifForm({...notifForm, schedule: e.target.value})}
                  min={getCurrentDateTime()}
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-400" 
                />
                <p className="text-xs text-slate-400 mt-1">Cannot schedule in the past</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleDiscard}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {editingNotif ? 'Cancel' : 'Discard'}
                </button>
                <button 
                  onClick={editingNotif ? handleUpdateNotif : handleSendNotification}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                  <Send size={14} />
                  {editingNotif ? 'Update' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}