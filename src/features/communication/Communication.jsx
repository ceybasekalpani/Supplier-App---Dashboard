import { Megaphone, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { focusNextFieldOnEnter } from '../../utils/keyboardNav'
import { themedPrimary } from './utils/communicationHelpers'
import { useCommunicationData } from './hooks/useCommunicationData'
import CommunicationToolbar from './components/CommunicationToolbar'
import NewsTable from './components/NewsTable'
import NotificationTable from './components/NotificationTable'
import NewsFormPanel from './components/NewsFormPanel'
import NotificationFormPanel from './components/NotificationFormPanel'

export default function Communication() {
  const c = useCommunicationData()

  return (
    <div className="space-y-5">
      {c.toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
          c.toast.type === 'error' ? 'bg-red-600' : ''
        }`} style={c.toast.type === 'error' ? undefined : themedPrimary}>
          {c.toast.message}
        </div>
      )}

      <PageHeader
        title="Communication Center"
        description="Manage supplier news updates and direct notifications."
        badge="Supplier communication"
        icon={Megaphone}
      />

      {c.loading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin" />
            Loading communication records...
          </span>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CommunicationToolbar
          tab={c.tab}
          onTabChange={c.handleTabChange}
          loading={c.loading}
          onRefresh={c.refreshCommunications}
          selectedNewsIds={c.selectedNewsIds}
          selectedNotifIds={c.selectedNotifIds}
          deletingKey={c.deletingKey}
          onBulkDeleteNews={c.handleBulkDeleteNews}
          onBulkDeleteNotifications={c.handleBulkDeleteNotifications}
          newsFilter={c.newsFilter}
          notifFilter={c.notifFilter}
          newsItems={c.newsItems}
          notifications={c.notifications}
          onNewsFilterChange={c.handleNewsFilterChange}
          onNotifFilterChange={c.handleNotifFilterChange}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <c.ActiveTabIcon size={17} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {c.tab === 'news' ? 'News Board' : 'Notification Queue'}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {(c.tab === 'news' ? c.filteredNews : c.filteredNotifications).length} records
              </span>
            </div>

            {c.tab === 'news' ? (
              <NewsTable
                items={c.filteredNews}
                selectedIds={c.selectedNewsIds}
                allSelected={c.allNewsSelected}
                deletableCount={c.deletableNews.length}
                deletingKey={c.deletingKey}
                canUpdateNews={c.canUpdateNews}
                canDeleteNews={c.canDeleteNews}
                onToggleSelectAll={c.toggleSelectAllNews}
                onToggleSelection={c.toggleNewsSelection}
                onEdit={c.handleEditNews}
                onDelete={c.handleDeleteNews}
              />
            ) : (
              <NotificationTable
                items={c.filteredNotifications}
                selectedIds={c.selectedNotifIds}
                allSelected={c.allNotifsSelected}
                deletableCount={c.deletableNotifications.length}
                deletingKey={c.deletingKey}
                canUpdateNotif={c.canUpdateNotif}
                canDeleteNotif={c.canDeleteNotif}
                onToggleSelectAll={c.toggleSelectAllNotifs}
                onToggleSelection={c.toggleNotifSelection}
                onEdit={c.handleEditNotif}
                onDelete={c.handleDeleteNotif}
              />
            )}
          </div>

          <aside className="bg-slate-50/70 p-4 dark:bg-slate-900/30" onKeyDown={focusNextFieldOnEnter}>
            {c.tab === 'news' ? (
              <NewsFormPanel
                form={c.newsForm}
                onFormChange={c.setNewsForm}
                active={c.active}
                onActiveChange={c.setActive}
                editingNews={c.editingNews}
                routeOptions={c.routeOptions}
                saving={c.saving}
                canCreateNews={c.canCreateNews}
                canUpdateNews={c.canUpdateNews}
                onDiscard={c.handleDiscard}
                onSubmit={c.editingNews ? c.handleUpdateNews : c.handleCreateNews}
              />
            ) : (
              <NotificationFormPanel
                form={c.notifForm}
                onFormChange={c.setNotifForm}
                editingNotif={c.editingNotif}
                routeOptions={c.routeOptions}
                saving={c.saving}
                canCreateNotif={c.canCreateNotif}
                canUpdateNotif={c.canUpdateNotif}
                onDiscard={c.handleDiscard}
                onSubmit={c.editingNotif ? c.handleUpdateNotif : c.handleSendNotification}
              />
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
