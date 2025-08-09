"use client"

import * as React from "react";
import {
    addDays,
    format,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
    initialFrom?: string
    initialTo?: string
    onChange?: (range: DateRange | undefined) => void
}

const presets = [
    {
        label: "Aujourd'hui",
        range: {
            from: startOfDay(new Date()),
            to: endOfDay(new Date()),
        },
    },
    {
        label: "Cette semaine",
        range: {
            from: startOfWeek(new Date(), { locale: fr }),
            to: endOfWeek(new Date(), { locale: fr }),
        },
    },
    {
        label: "Ce mois-ci",
        range: {
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        },
    },
    {
        label: "Le mois dernier",
        range: {
            from: startOfMonth(subMonths(new Date(), 1)),
            to: endOfMonth(subMonths(new Date(), 1)),
        },
    },
];

export function DateRangePicker({ initialFrom, initialTo, onChange }: DateRangePickerProps) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: initialFrom ? new Date(initialFrom) : addDays(new Date(), -7),
        to: initialTo ? new Date(initialTo) : new Date(),
    })

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range)
        if (onChange) {
            onChange(range)
        }
    }

    const applyPreset = (range: DateRange) => {
        setDate(range)
        if (onChange) {
            onChange(range)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start">
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                                {format(date.to, "dd/MM/yyyy", { locale: fr })}
                            </>
                        ) : (
                            format(date.from, "dd/MM/yyyy", { locale: fr })
                        )
                    ) : (
                        <span>Sélectionner une période</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-4" align="start">
                {/* Boutons de presets */}
                <div className="mb-4 flex gap-2 flex-wrap">
                    {presets.map(({ label, range }) => (
                        <Button
                            key={label}
                            variant="ghost"
                            size="sm"
                            onClick={() => applyPreset(range)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Calendrier */}
                <Calendar
                    autoFocus
                    locale={fr}
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    )
}
