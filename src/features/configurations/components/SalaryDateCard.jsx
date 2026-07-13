import { useEffect, useState } from 'react'
import { Calendar, Info, RefreshCw, Save } from 'lucide-react'
import { factorySettingsApi } from '../../../services/factorySettingsApi'
import { themedAccent } from '../utils/configurationConstants'

export default function SalaryDateCard({ canUpdateSalaryDate }) {
  const [salaryDate, setSalaryDate] = useState('')
  const [draftDate, setDraftDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    factorySettingsApi
      .getSettings({ signal: controller.signal })
      .then(result => {
        setSalaryDate(result.salaryDate)
        setDraftDate(result.salaryDate)
      })
      .catch(fetchError => {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load salary date')
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const handleSave = async () => {
    if (saving || !draftDate) return

    if (!canUpdateSalaryDate) {
      setError('You do not have permission to update the salary date.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await factorySettingsApi.updateSalaryDate(draftDate)
      setSalaryDate(result.salaryDate)
      setDraftDate(result.salaryDate)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (saveError) {
      setError(saveError.message || 'Unable to update salary date')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={themedAccent.icon}>
            <Calendar size={16} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Salary Date</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used to calculate advance eligibility in Supplier Details across the dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={draftDate}
            disabled={loading || !canUpdateSalaryDate}
            onChange={event => setDraftDate(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-green-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !canUpdateSalaryDate || draftDate === salaryDate || !draftDate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={themedAccent.button}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      {!canUpdateSalaryDate && (
        <p className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info size={13} className="mt-0.5 shrink-0" />
          Only admins with Settings update permission can change the salary date. You can still view the current value.
        </p>
      )}

      {error && <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="mt-3 text-xs font-semibold text-green-700 dark:text-green-400">Salary date updated successfully.</p>}
    </section>
  )
}
