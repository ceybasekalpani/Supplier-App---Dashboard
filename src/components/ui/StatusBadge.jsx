import { useTheme } from '../../context/useTheme'

export const statusStyles = {
  pending: {
    light: { background: '#FEF9C3', border: '#FACC15', text: '#A16207' },
    dark: { background: '#422006', border: '#CA8A04', text: '#FDE047' },
  },
  completed: {
    light: { background: '#DCFCE7', border: '#86EFAC', text: '#166534' },
    dark: { background: '#052E16', border: '#16A34A', text: '#4ADE80' },
  },
  awaiting: {
    light: { background: '#FFF7ED', border: '#FDBA74', text: '#C2410C' },
    dark: { background: '#431407', border: '#C2410C', text: '#FB923C' },
  },
  scheduled: {
    light: { background: '#FFF7ED', border: '#FDBA74', text: '#C2410C' },
    dark: { background: '#431407', border: '#C2410C', text: '#FB923C' },
  },
  rejected: {
    light: { background: '#FEE2E2', border: '#F87171', text: '#B91C1C' },
    dark: { background: '#450A0A', border: '#DC2626', text: '#FCA5A5' },
  },
  approved: {
    light: { background: '#DCFCE7', border: '#86EFAC', text: '#166534' },
    dark: { background: '#052E16', border: '#16A34A', text: '#4ADE80' },
  },
  expired: {
    light: { background: '#FEE2E2', border: '#F87171', text: '#B91C1C' },
    dark: { background: '#450A0A', border: '#DC2626', text: '#FCA5A5' },
  },
  active: {
    light: { background: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
    dark: { background: '#052E16', border: '#15803D', text: '#4ADE80' },
  },
  inactive: {
    light: { background: '#F8FAFC', border: '#CBD5E1', text: '#64748B' },
    dark: { background: '#1E293B', border: '#475569', text: '#94A3B8' },
  },
  draft: {
    light: { background: '#FEF9C3', border: '#FACC15', text: '#A16207' },
    dark: { background: '#422006', border: '#CA8A04', text: '#FDE047' },
  },
  delivered: {
    light: { background: '#ECFDF5', border: '#6EE7B7', text: '#047857' },
    dark: { background: '#022C22', border: '#047857', text: '#34D399' },
  },
  dispatched: {
    light: { background: '#DCFCE7', border: '#86EFAC', text: '#166534' },
    dark: { background: '#052E16', border: '#16A34A', text: '#4ADE80' },
  },
  issued: {
    light: { background: '#DCFCE7', border: '#86EFAC', text: '#166534' },
    dark: { background: '#052E16', border: '#16A34A', text: '#4ADE80' },
  },
  failed: {
    light: { background: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' },
    dark: { background: '#450A0A', border: '#B91C1C', text: '#F87171' },
  },
}

export const normalizeStatus = status => {
  const normalized = String(status || '').trim().toLowerCase().replace(/\s+/g, '_')

  if (normalized.includes('pending')) return 'pending'
  if (normalized.includes('awaiting')) return 'awaiting'
  if (normalized.includes('scheduled')) return 'scheduled'
  if (normalized.includes('delivered')) return 'delivered'
  if (normalized.includes('dispatched')) return 'dispatched'
  if (normalized.includes('issued')) return 'dispatched'
  if (normalized.includes('inactive')) return 'inactive'
  if (normalized.includes('active')) return 'active'
  if (normalized.includes('draft')) return 'draft'
  if (normalized.includes('failed')) return 'failed'
  if (normalized.includes('complete')) return 'completed'
  if (normalized.includes('approved')) return 'approved'
  if (normalized.includes('rejected')) return 'rejected'
  if (normalized.includes('expired')) return 'expired'

  return normalized
}

export const getStatusPalette = (status, dark = false) => {
  const normalized = normalizeStatus(status)
  return statusStyles[normalized]?.[dark ? 'dark' : 'light'] || statusStyles.inactive[dark ? 'dark' : 'light']
}

export const getStatusChartColor = status => {
  const normalized = normalizeStatus(status)

  if (['approved', 'completed', 'active', 'delivered', 'dispatched', 'issued'].includes(normalized)) return '#16A34A'
  if (['pending', 'draft'].includes(normalized)) return '#EAB308'
  if (['awaiting', 'scheduled'].includes(normalized)) return '#F97316'
  if (['rejected', 'expired', 'failed'].includes(normalized)) return '#DC2626'

  return '#64748B'
}

export default function StatusBadge({ status, showDot = false, className = '' }) {
  const { dark } = useTheme()
  const normalized = normalizeStatus(status)
  const palette = getStatusPalette(normalized, dark)
  const label = normalized || String(status || '').replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize border ${className}`}
      style={{
        backgroundColor: palette.background,
        borderColor: palette.border,
        color: palette.text,
      }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: palette.text }}
        />
      )}
      {label.replace(/_/g, ' ')}
    </span>
  )
}
