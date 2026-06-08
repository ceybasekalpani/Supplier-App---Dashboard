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
      <span className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-textSecondary)' }}>
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 disabled:opacity-70"
        style={{
          backgroundColor: 'var(--theme-inputBg)',
          borderColor: error ? 'var(--theme-error)' : 'var(--theme-border)',
          color: 'var(--theme-text)',
          '--tw-ring-color': 'color-mix(in srgb, var(--theme-primary) 20%, transparent)',
        }}
      />
      {error && <p className="text-xs mt-1" style={{ color: 'var(--theme-error)' }}>{error}</p>}
    </label>
  )
}
