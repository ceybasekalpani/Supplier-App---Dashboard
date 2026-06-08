export default function PageHeader({ title, description, badge, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        {badge && (
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold mb-3"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)', color: 'var(--theme-primary)' }}
          >
            {Icon && <Icon size={13} />}
            {badge}
          </div>
        )}
        <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{title}</h1>
        {description && <p className="text-sm mt-1" style={{ color: 'var(--theme-textSecondary)' }}>{description}</p>}
      </div>
    </div>
  )
}
