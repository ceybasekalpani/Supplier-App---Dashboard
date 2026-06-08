import { Sun, Moon } from 'lucide-react'
import { env } from '../../config/env'
import { useTheme } from '../../context/useTheme'
import Avatar from '../ui/Avatar'

export default function Topbar({ pageTitle }) {
  const { dark, setDark } = useTheme()

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 h-14 flex items-center px-6 gap-4">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
        <p className="text-xs text-slate-400">{env.appName} / {pageTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDark(d => !d)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <Avatar name="Rajitha Admin" size="sm" />
      </div>
    </header>
  )
}
