import { cn } from '@/lib/utils'

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-100">
      {children}
    </thead>
  )
}

export function Th({ children, className }) {
  return (
    <th className={cn('table-header', className)}>{children}</th>
  )
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>
}

export function Tr({ children, className, onClick }) {
  return (
    <tr
      className={cn('hover:bg-gray-50/60 transition-colors', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className }) {
  return (
    <td className={cn('table-cell', className)}>{children}</td>
  )
}

export function EmptyRow({ cols, message = 'No data found' }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📭</span>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  )
}
