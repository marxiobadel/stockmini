import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    format,
    startOfDay, endOfDay, subDays,
    startOfWeek, endOfWeek, subWeeks,
    startOfMonth, endOfMonth, subMonths,
    startOfYear, endOfYear, subYears
} from "date-fns"
import { router } from '@inertiajs/react';

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

export const handlePresetChange = (value: string, route: string) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    // Calcul des dates en fonction du choix
    switch (value) {
        case 'today':
            from = startOfDay(now);
            to = endOfDay(now);
            break;
        case 'yesterday':
            from = startOfDay(subDays(now, 1));
            to = endOfDay(subDays(now, 1));
            break;
        case 'this_week':
            // weekStartsOn: 1 signifie que la semaine commence le Lundi
            from = startOfWeek(now, { weekStartsOn: 1 });
            to = endOfWeek(now, { weekStartsOn: 1 });
            break;
        case 'last_week':
            from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
            to = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
            break;
        case 'this_month':
            from = startOfMonth(now);
            to = endOfMonth(now);
            break;
        case 'last_month':
            from = startOfMonth(subMonths(now, 1));
            to = endOfMonth(subMonths(now, 1));
            break;
        case 'this_year':
            from = startOfYear(now);
            to = endOfYear(now);
            break;
        case 'last_year':
            from = startOfYear(subYears(now, 1));
            to = endOfYear(subYears(now, 1));
            break;
        case 'all':
        default:
            from = undefined;
            to = undefined;
            break;
    }

    // Préparation des paramètres d'URL
    const queryParams: Record<string, string | undefined> = {};

    if (from) queryParams.from = format(from, "yyyy-MM-dd");
    if (to) queryParams.to = format(to, "yyyy-MM-dd");
    if (value !== 'all') queryParams.preset = value; // On garde le preset en mémoire

    // Envoi de la requête au backend
    router.get(route, queryParams,
        {
            preserveState: true,
            preserveScroll: true,
            replace: true
        }
    )
}
