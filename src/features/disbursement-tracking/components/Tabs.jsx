export default function Tabs({ activeTab, onTabChange, trackingCount, advanceReceiptsCount }) {
  const tabs = [
    { id: 'tracking', label: 'Delivery Note Tracking', count: trackingCount },
    { id: 'advance-receipts', label: 'Advance Receipt Confirmation', count: advanceReceiptsCount },
  ]

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-t-lg border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-green-600 bg-white text-green-700 dark:bg-slate-800 dark:text-green-300'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  )
}
