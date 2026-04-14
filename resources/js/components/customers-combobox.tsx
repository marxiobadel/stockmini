"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
    value: number | string;
    label: string;
}

interface CustomersComboBoxProps {
    options: Option[];
    value: (number | string)[];
    onChange: (value: (number | string)[]) => void;
    placeholder?: string;
}

export function CustomersComboBox({
    options,
    value,
    onChange,
    placeholder = "Sélectionner des clients"
}: CustomersComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const toggleValue = (val: number | string) => {
        if (value.includes(val)) {
            onChange(value.filter(v => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const selectedLabels = options
        .filter(o => value.includes(o.value))
        .map(o => o.label)
        .join(", ");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="mt-1 w-full justify-between"
                >
                    {selectedLabels || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher un client..." />
                    <CommandList>
                        <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleValue(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
