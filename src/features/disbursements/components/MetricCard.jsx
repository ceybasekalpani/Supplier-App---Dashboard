export default function MetricCard({ label, value, icon: Icon, className }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <Icon size={22} />
      </div>
    </div>
  )
}
