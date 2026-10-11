import { cn } from '@/lib/utils'

const variants = {
  default:  'bg-gray-100 text-gray-700',
  primary:  'bg-primary-100 text-primary-700',
  success:  'bg-green-100 text-green-700',
  warning:  'bg-amber-100 text-amber-700',
  danger:   'bg-red-100 text-red-700',
  info:     'bg-blue-100 text-blue-700',
  earth:    'bg-earth-100 text-earth-700',
  cash:     'bg-green-100 text-green-700 border border-green-200',
  upi:      'bg-violet-100 text-violet-700 border border-violet-200',
  inStock:  'bg-green-100 text-green-700',
  lowStock: 'bg-amber-100 text-amber-700',
  outStock: 'bg-red-100 text-red-700',
}

export function Badge({ children, variant = 'default', className, dot }) {
  return (
    <span className={cn('badge', variants[variant] || variants.default, className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 inline-block', dot)} />}
      {children}
    </span>
  )
}
