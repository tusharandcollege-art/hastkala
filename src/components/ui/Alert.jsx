import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const config = {
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  icon_color: 'text-blue-500' },
  success: { icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', icon_color: 'text-green-500' },
  warning: { icon: AlertCircle,   bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-500' },
  danger:  { icon: XCircle,       bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   icon_color: 'text-red-500' },
}

export function Alert({ type = 'info', title, children, onClose, className }) {
  const c = config[type] || config.info
  const Icon = c.icon
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border text-sm',
      c.bg, c.border, c.text, className
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', c.icon_color)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in">
      <Alert type={type} onClose={onClose}>{message}</Alert>
    </div>
  )
}
