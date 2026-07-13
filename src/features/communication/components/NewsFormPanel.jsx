import { CalendarDays, Check, Edit3, Newspaper, RefreshCw, X } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import Toggle from '../../../components/ui/Toggle'
import { audienceOptions, getTodayDate, themedInput, themedPrimary, themedPrimaryBorder, themedPrimarySoft } from '../utils/communicationHelpers'

export default function NewsFormPanel({
  form,
  onFormChange,
  active,
  onActiveChange,
  editingNews,
  routeOptions,
  saving,
  canCreateNews,
  canUpdateNews,
  onDiscard,
  onSubmit,
}) {
  return (
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
            value={form.title}
            onChange={event => onFormChange({ ...form, title: event.target.value })}
            placeholder="Enter title..."
            className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
            style={themedInput}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Message Content</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={event => onFormChange({ ...form, description: event.target.value })}
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
              value={form.expiryDate}
              onChange={event => onFormChange({ ...form, expiryDate: event.target.value })}
              min={getTodayDate()}
              className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
              style={themedInput}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Audience</label>
          <Combobox
            value={form.audienceType}
            onChange={value => onFormChange({
              ...form,
              audienceType: value,
              targetRegNo: value === 'SpecificSupplier' ? form.targetRegNo : '',
              targetRoute: value === 'Route' ? form.targetRoute : '',
            })}
            options={audienceOptions}
            buttonClassName="py-2.5 dark:bg-slate-900"
            style={themedInput}
          />
        </div>
        {form.audienceType === 'SpecificSupplier' && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Supplier Reg No</label>
            <input
              type="text"
              value={form.targetRegNo}
              onChange={event => onFormChange({ ...form, targetRegNo: event.target.value })}
              inputMode="numeric"
              placeholder="Enter supplier registration number"
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 dark:bg-slate-900 dark:text-slate-300"
              style={themedInput}
            />
          </div>
        )}
        {form.audienceType === 'Route' && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Route</label>
            <Combobox
              value={form.targetRoute}
              onChange={value => onFormChange({ ...form, targetRoute: value })}
              options={routeOptions}
              placeholder={routeOptions.length === 0 ? 'No routes available' : 'Select route'}
              disabled={routeOptions.length === 0}
              buttonClassName="py-2.5 dark:bg-slate-900"
              style={themedInput}
            />
          </div>
        )}
        <Toggle checked={active} onChange={event => onActiveChange(event.target.checked)} label="Publish now" />

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <span className="inline-flex items-center gap-2">
              <X size={14} />
              {editingNews ? 'Cancel' : 'Discard'}
            </span>
          </button>
          <button
            type="button"
            onClick={onSubmit}
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
  )
}
