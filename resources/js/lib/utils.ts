import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function classNames(...arr: Array<string | false | null | undefined>): string {
    return arr.filter(Boolean).join(" ")
};

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

export function plural(quantity: number, singular: string, plural?: string): string {
    if (!plural) {
        plural = singular + 's';
    }

    return `${quantity} ${quantity <= 1 ? singular : plural}`;
}

export const inputClassNames = (...arr: Array<string | false | null | undefined>): string => {
    return classNames("focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent", ...arr);
};

export const buttonClassNames = (...arr: Array<string | false | null | undefined>): string => {
    return classNames("relative overflow-hidden font-medium text-white rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300", ...arr);
}

export const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
};
