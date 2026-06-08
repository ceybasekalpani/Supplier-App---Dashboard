export default function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-70 ${
          error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600'
        }`}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </label>
  )
}
