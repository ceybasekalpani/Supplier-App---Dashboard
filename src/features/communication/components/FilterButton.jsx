import { getStatusPalette } from '../../../components/ui/StatusBadge'
import { useTheme } from '../../../context/useTheme'

export default function FilterButton({ filter, activeFilter, count, onClick }) {
  const isActive = filter === activeFilter
  const { dark } = useTheme()
  const palette = filter === 'all'
    ? dark
      ? { background: '#1E293B', border: '#475569', text: '#CBD5E1' }
      : { background: '#F1F5F9', border: '#CBD5E1', text: '#475569' }
    : getStatusPalette(filter, dark)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
        isActive ? '' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      style={isActive ? {
        backgroundColor: palette.background,
        borderColor: palette.border,
        color: palette.text,
      } : undefined}
    >
      {filter}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/50 dark:bg-slate-900/30' : 'bg-slate-100 dark:bg-slate-900'}`}>
        {count}
      </span>
    </button>
  )
}
