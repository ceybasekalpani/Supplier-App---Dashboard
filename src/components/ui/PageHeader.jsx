export default function PageHeader({ title, description, badge, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold mb-3">
            {Icon && <Icon size={13} />}
            {badge}
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  )
}
