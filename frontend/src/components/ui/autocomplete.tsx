import { Command as CommandPrimitive } from "cmdk";
import { Check, X } from "lucide-react";
import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
    type KeyboardEvent,
    forwardRef,
} from "react";

import { cn } from "@/lib/utils";

import {
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
} from "./command";
import { ScrollArea } from "./scroll-area";
import { Skeleton } from "./skeleton";

export type Option = {
    value: string;
    label: string;
    [key: string]: string;
};

type AutoCompleteProps = {
    options: Array<Option>;
    emptyMessage: string;
    value?: Option;
    onValueChange?: (value: Option) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    showClearButton?: boolean; // Nuevo prop
};

const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>((
    {
        options,
        placeholder,
        emptyMessage,
        value,
        onValueChange,
        disabled,
        isLoading = false,
        className,
        showClearButton = true, // Nuevo prop
    },
    ref,
) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setOpen] = useState(false);
    const [selected, setSelected] = useState<Option | undefined>(value);
    const [inputValue, setInputValue] = useState<string>(value?.label || "");

    // Actualiza el estado interno cuando cambia la propiedad value
    useEffect(() =>
    {
        setSelected(value);
        setInputValue(value?.label || "");
    }, [value]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) =>
        {
            const input = inputRef.current;
            if (!input)
            {
                return;
            }

            if (!isOpen)
            {
                setOpen(true);
            }

            if (event.key === "Enter" && input.value.trim() !== "")
            {
                // Buscar coincidencias exactas basadas en el label
                const exactMatches = options.filter((option) => option.label.toLowerCase() ===
                    input.value.trim().toLowerCase());

                if (exactMatches.length === 1)
                {
                    setSelected(exactMatches[0]);
                    onValueChange?.(exactMatches[0]);
                    setOpen(false);
                }
                else if (exactMatches.length > 1)
                {
                    // Seleccionar la primera coincidencia o manejar múltiples según se requiera
                    setSelected(exactMatches[0]);
                    onValueChange?.(exactMatches[0]);
                    setOpen(false);
                }
                else
                {
                    // Opcional: manejar caso donde no hay coincidencias
                }
            }

            if (event.key === "Escape")
            {
                input.blur();
            }
        },
        [isOpen, options, onValueChange],
    );

    const handleBlur = useCallback(() =>
    {
        setOpen(false);
        setInputValue(selected?.label || "");
    }, [selected]);

    const handleSelectOption = useCallback(
        (selectedOption: Option) =>
        {
            setInputValue(selectedOption.label);
            setSelected(selectedOption);
            onValueChange?.(selectedOption);
            setOpen(false);

            setTimeout(() =>
            {
                inputRef?.current?.blur();
            }, 0);
        },
        [onValueChange],
    );

    const handleClearSelection = useCallback(() =>
    {
        const emptyOption: Option = { value: "", label: "" };
        setSelected(undefined);
        setInputValue("");
        onValueChange?.(emptyOption);
        inputRef.current?.focus();
    }, [onValueChange]);

    const handleInputClick = useCallback(() =>
    {
        setOpen((prev) => !prev);
    }, []);

    return (
        <CommandPrimitive onKeyDown={handleKeyDown}>
            <div className="relative">
                <CommandInput
                    ref={ref}
                    value={inputValue}
                    onValueChange={isLoading ? undefined : setInputValue}
                    onBlur={handleBlur}
                    // onFocus={() => setOpen(true)}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(className, "pr-8 capitalize")}
                />
                {selected && showClearButton && (
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                        onClick={handleClearSelection}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div
                className={cn(
                    "relative",
                    isOpen ? "mt-1" : "mt-0",
                    className,
                )}
            >
                <div
                    className={cn(
                        "absolute top-0 z-10 w-full rounded-xl border border-input bg-white shadow outline-none animate-in fade-in-0 zoom-in-95",
                        isOpen ? "block" : "hidden",
                    )}
                >
                    <ScrollArea className="h-[10rem]">
                        <CommandList className="h-full rounded-lg capitalize">
                            {isLoading && (
                                <CommandPrimitive.Loading>
                                    <div className="p-1">
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </CommandPrimitive.Loading>
                            )}
                            {!isLoading && options.length > 0 && (
                                <CommandGroup>
                                    {options.map((option) =>
                                    {
                                        const isSelected =
                                            selected?.value ===
                                            option.value;
                                        return (
                                            <CommandItem
                                                // Cambia el valor a option.value para asegurar unicidad
                                                key={option.value}
                                                value={option.label}
                                                onMouseDown={(event) =>
                                                {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                }}
                                                onSelect={() => handleSelectOption(option)
                                                }
                                                className={cn(
                                                    "flex w-full items-center gap-2",
                                                    !isSelected
                                                        ? "pl-8"
                                                        : null,
                                                )}
                                            >
                                                {isSelected && (
                                                    <Check className="w-4" />
                                                )}
                                                {/* Muestra la etiqueta dentro del CommandItem */}
                                                {option.label}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                            {!isLoading && options.length === 0 && (
                                <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                                    {emptyMessage}
                                </CommandPrimitive.Empty>
                            )}
                        </CommandList>
                    </ScrollArea>
                </div>
            </div>
        </CommandPrimitive>
    );
});

AutoComplete.displayName = "AutoComplete";

export { AutoComplete };
