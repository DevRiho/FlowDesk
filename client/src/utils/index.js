import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility helper to safely merge Tailwind CSS classes with dynamic conditionals
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Currency formatter for invoices and revenue figures
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

// Date formatter for readable milestones and task due dates
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

