import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return isValid(d) ? format(d, 'dd MMM yyyy') : '—'
  } catch { return '—' }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return isValid(d) ? format(d, 'dd MMM yyyy, hh:mm a') : '—'
  } catch { return '—' }
}

export function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getStockStatus(qty) {
  if (qty <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
  if (qty <= 5) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
  return { label: 'In Stock', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}
