import { RefreshCw } from 'lucide-react'

export default function DeleteUserModal({ open, deleting, onCancel, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Deletion</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70">
            <span className="inline-flex items-center justify-center gap-2">
              {deleting && <RefreshCw size={14} className="animate-spin" />}
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
