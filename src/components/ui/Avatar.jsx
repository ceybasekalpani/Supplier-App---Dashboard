export default function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}