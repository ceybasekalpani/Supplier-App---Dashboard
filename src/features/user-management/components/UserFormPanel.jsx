import { Camera, Eye, EyeOff, RefreshCw, X } from 'lucide-react'
import Combobox from '../../../components/ui/Combobox'
import FormInput from '../../../components/ui/FormInput'
import { focusNextFieldOnEnter } from '../../../utils/keyboardNav'

export default function UserFormPanel({
  editingUser,
  formData,
  onFieldChange,
  errors,
  resolvedImagePreview,
  imagePreview,
  fileInputRef,
  onImageUpload,
  onClearImage,
  showFormPassword,
  onToggleShowFormPassword,
  saving,
  canCreateUser,
  canUpdateUser,
  onSave,
  onDiscard,
}) {
  return (
    <div className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4" onKeyDown={focusNextFieldOnEnter}>
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">{editingUser ? 'Edit User' : 'Create New User'}</h3>
        {editingUser && <button onClick={onDiscard} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>}
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors overflow-hidden bg-slate-50 dark:bg-slate-700/30">
            {resolvedImagePreview ? <img src={resolvedImagePreview} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={28} />}
          </button>
          {imagePreview && <button type="button" onClick={onClearImage} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"><X size={12} /></button>}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageUpload} className="hidden" />
        </div>
      </div>

      <div className="space-y-3">
        {['fullName', 'email', 'username', 'phoneNo'].map((field) => {
          const label = { fullName: 'Full Name', email: 'Email Address', username: 'Username', phoneNo: 'Phone Number' }[field]
          const inputType = field === 'email' ? 'email' : field === 'phoneNo' ? 'tel' : 'text'
          return (
            <FormInput
              key={field}
              label={label}
              name={field}
              type={inputType}
              value={formData[field]}
              required
              error={errors[field]}
              placeholder={`Enter ${label.toLowerCase()}`}
              inputMode={field === 'phoneNo' ? 'numeric' : undefined}
              maxLength={field === 'phoneNo' ? 10 : undefined}
              autoComplete={field === 'email' ? 'email' : field === 'username' ? 'username' : field === 'phoneNo' ? 'tel' : 'name'}
              onChange={(e) => {
                const value = field === 'phoneNo' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
                onFieldChange(field, value)
              }}
            />
          )
        })}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <input
              type={showFormPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              autoComplete="new-password"
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
              onChange={(e) => onFieldChange('password', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={onToggleShowFormPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
              title={showFormPassword ? 'Hide password' : 'Show password'}
            >
              {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
          {editingUser && (
            <p className="mt-1 text-xs text-slate-400">
              Existing stored passwords cannot be viewed unless the API returns a plain or temporary password.
            </p>
          )}
        </div>
        <div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <Combobox
              value={formData.status}
              onChange={(value) => onFieldChange('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              buttonClassName="border-slate-300 bg-white py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            {errors.status && <p className="mt-1 text-xs text-rose-500">{errors.status}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onDiscard} className="flex-1 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{editingUser ? 'Cancel' : 'Discard'}</button>
        <button onClick={onSave} disabled={saving || (editingUser ? !canUpdateUser : !canCreateUser)} className="flex-1 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-70">
          <span className="inline-flex items-center justify-center gap-2">
            {saving && <RefreshCw size={14} className="animate-spin" />}
            {editingUser ? 'Update User' : 'Create User'}
          </span>
        </button>
      </div>
    </div>
  )
}
