import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LogIn, RefreshCw } from 'lucide-react'
import { adminAuthApi } from '../services/adminAuthApi'
import { focusNextFieldOnEnter } from '../utils/keyboardNav'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const handleChange = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }))

    setError('')
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const username = form.username.trim()
    const password = form.password

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await adminAuthApi.login({ username, password })
      navigate(redirectTo, { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Invalid dashboard admin username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <form
        onSubmit={handleSubmit}
        onKeyDown={focusNextFieldOnEnter}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Leaf size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Admin Login
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage suppliers, requests, and factory dashboard data.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Username
            </span>

            <input
              value={form.username}
              onChange={event => handleChange('username', event.target.value)}
              autoComplete="username"
              placeholder="Dashboard username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-green-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Password
            </span>

            <input
              type="password"
              value={form.password}
              onChange={event => handleChange('password', event.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-green-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <LogIn size={16} />}
            Login
          </button>
        </div>
      </form>
    </main>
  )
}
