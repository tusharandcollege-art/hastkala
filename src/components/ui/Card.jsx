import { cn } from '@/lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>
}

export function CardBody({ children, className }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>
}
