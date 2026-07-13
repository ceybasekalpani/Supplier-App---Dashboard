import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Toast({ type, message }) {
  if (!message) return null

  if (type === 'error') {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg">
        <AlertCircle size={16} /> {message}
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-white shadow-lg">
      <CheckCircle size={16} /> {message}
    </div>
  )
}
