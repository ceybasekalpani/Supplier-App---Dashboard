import { useTheme } from '../../context/useTheme'
import { hexToRgba } from '../../theme/colors'

const statusColorKey = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  delivered: 'success',
  pending: 'warning',
  awaiting: 'warning',
  scheduled: 'info',
  draft: 'info',
  inactive: 'disabled',
  rejected: 'error',
  expired: 'error',
  failed: 'error',
}

export default function StatusBadge({ status }) {
  const { theme } = useTheme()
  const color = theme[statusColorKey[status] || 'disabled']

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border"
      style={{
        backgroundColor: hexToRgba(color, 0.14),
        borderColor: hexToRgba(color, 0.28),
        color,
      }}
    >
      {status}
    </span>
  )
}
