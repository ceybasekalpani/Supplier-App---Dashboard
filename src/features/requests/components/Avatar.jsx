import { initials } from '../utils/requestsHelpers'

export default function Avatar({ name, size = 'md' }) {
  const classes = size === 'xl' ? 'w-14 h-14 text-lg' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'

  return (
    <div className={`${classes} rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 shrink-0`}>
      {initials(name)}
    </div>
  )
}
