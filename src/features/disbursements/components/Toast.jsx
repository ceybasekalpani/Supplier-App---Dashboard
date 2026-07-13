import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Toast({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg ${isError ? 'bg-red-600' : 'bg-green-700'}`}>
      <Icon size={16} /> {message}
    </div>
  )
}
