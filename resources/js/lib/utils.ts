import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function currencyFormatter(
    amount: number,
    currency: string = 'XAF',
    locale: string = 'fr'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
}
