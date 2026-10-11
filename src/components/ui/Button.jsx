import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function Button({
  children, variant = 'primary', size = 'md',
  loading, className, disabled, ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-primary-500 hover:bg-primary-600 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600',
    ghost:     'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    success:   'bg-green-500 hover:bg-green-600 text-white',
    outline:   'border border-gray-200 hover:bg-gray-50 text-gray-700',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-xs',
    md:  'px-4 py-2.5 text-sm',
    lg:  'px-6 py-3 text-base',
    icon:'p-2',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
