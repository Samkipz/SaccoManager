import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parse, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a currency amount
 * @param amount string or number representing the currency amount
 * @param currency string representing the currency code (default: 'KES')
 * @returns formatted currency string
 */
export function formatCurrency(amount: string | number, currency: string = 'KES'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) return `${currency} 0.00`
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount)
}

/**
 * Format a date string to a readable format
 * @param dateString string or Date object
 * @param formatStr string representing the format to use (default: 'MMM d, yyyy')
 * @returns formatted date string or empty string if invalid
 */
export function formatDate(dateString: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return ''
  
  try {
    const date = typeof dateString === 'string' 
      ? new Date(dateString)
      : dateString
    
    if (!isValid(date)) return ''
    
    return format(date, formatStr)
  } catch (error) {
    console.error("Error formatting date:", error)
    return ''
  }
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 * @param dateString string or Date object
 * @returns formatted relative time string or empty string if invalid
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return ''
  
  try {
    const date = typeof dateString === 'string' 
      ? new Date(dateString)
      : dateString
    
    if (!isValid(date)) return ''
    
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return ''
  }
}

/**
 * Format a percentage value
 * @param value number or string representing the percentage value
 * @param decimalPlaces number of decimal places to show (default: 2)
 * @returns formatted percentage string
 */
export function formatPercentage(value: number | string, decimalPlaces: number = 2): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numericValue)) return '0%'
  
  return `${numericValue.toFixed(decimalPlaces)}%`
}

/**
 * Calculate the percentage of a value
 * @param value number representing the current value
 * @param total number representing the total value
 * @returns percentage as a number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Truncate text to a specified length
 * @param text string to truncate
 * @param length number of characters to keep (default: 100)
 * @param suffix string to append if truncated (default: '...')
 * @returns truncated text string
 */
export function truncateText(text: string, length: number = 100, suffix: string = '...'): string {
  if (!text) return ''
  if (text.length <= length) return text
  return `${text.substring(0, length).trim()}${suffix}`
}
