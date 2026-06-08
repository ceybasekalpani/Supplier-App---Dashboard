import { colors } from '../../theme/colors'

const variants = {
  ...colors.statusClass,
  draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  expired: colors.statusClass.rejected,
  delivered: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  failed: colors.statusClass.rejected,
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${variants[status] ?? variants.inactive}`}>
      {status}
    </span>
  )
}
