export default function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div
      className="border rounded-xl p-4"
      style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
    >
      {Icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      )}
      <p className="text-xs mb-1" style={{ color: 'var(--theme-textSecondary)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--theme-textMuted)' }}>{sub}</p>}
    </div>
  )
}
