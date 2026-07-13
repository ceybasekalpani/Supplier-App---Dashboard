import { AlertCircle } from 'lucide-react'

export default function EmptyTableRow({ colSpan, icon: Icon = AlertCircle, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-500">
        <Icon size={32} className="mx-auto mb-2 opacity-30" />
        {message}
      </td>
    </tr>
  )
}
