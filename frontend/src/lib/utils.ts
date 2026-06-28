import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount)
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  return format(new Date(date), fmt, { locale: vi })
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm')
}
