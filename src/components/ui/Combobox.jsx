import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

const normalizeOptions = (options) => (
  (options || []).map(option => (
    typeof option === 'string'
      ? { value: option, label: option }
      : { value: option.value, label: option.label ?? option.value }
  ))
)

export default function Combobox({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  placeholder = 'Select',
  disabled = false,
  style,
}) {
  const id = useId()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const selectedOption = normalizedOptions.find(option => String(option.value) === String(value))

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSelect = (nextValue) => {
    onChange?.(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 outline-none transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/10 ${buttonClassName}`}
        style={style}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate capitalize">{selectedOption?.label || placeholder}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-50 mt-1 max-h-64 min-w-full overflow-auto rounded-lg border border-emerald-200 bg-white py-1 shadow-lg dark:border-emerald-900/50 dark:bg-slate-900 ${menuClassName}`}
          role="listbox"
          aria-labelledby={id}
        >
          {normalizedOptions.map(option => {
            const selected = String(option.value) === String(value)

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? 'bg-emerald-700 font-semibold text-white'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-900/25 dark:hover:text-emerald-200'
                }`}
              >
                <span className="block truncate capitalize">{option.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
