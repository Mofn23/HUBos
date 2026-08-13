import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  const cleanCode = currency ? currency.replace(/[^a-zA-Z]/g, '').trim().toUpperCase() || 'COP' : 'COP';
  
  if (cleanCode === 'COP') {
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: cleanCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('es-CO');
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
