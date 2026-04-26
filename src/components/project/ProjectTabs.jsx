export default function ProjectTabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-[var(--border)] mb-6">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.value
              ? 'border-b-2 border-orange-500 text-white'
              : 'text-slate-400 hover:text-slate-200 opacity-60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
