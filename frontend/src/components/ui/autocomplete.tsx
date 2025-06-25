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
	showClearButton?: boolean;
	renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
	searchKeys?: Array<string>;
    inputBordered?: boolean; // <-- Nuevo prop opcional
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
        showClearButton = true,
        renderOption,
        searchKeys = ["label"], // <-- Por defecto solo label
        inputBordered = false,
    },
    ref,
) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setOpen] = useState(false);
    const [selected, setSelected] = useState<Option | undefined>(value);
    const [inputValue, setInputValue] = useState<string>(value?.label ?? "");

    // Actualiza el estado interno cuando cambia la propiedad value
    useEffect(() =>
    {
        setSelected(value);
        setInputValue(value?.label ?? "");
    }, [value]);

    // Filtrado flexible por searchKeys
    const filteredOptions = options.filter((option) => searchKeys.some((key) => (option[key] ?? "")
        .toLowerCase()
        .includes(inputValue.trim().toLowerCase())));

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
                // Buscar coincidencias exactas en searchKeys
                const exactMatches = options.filter((option) => searchKeys.some((key) => (option[key] ?? "").toLowerCase() ===
								input.value.trim().toLowerCase()));

                if (exactMatches.length === 1)
                {
                    setSelected(exactMatches[0]);
                    onValueChange?.(exactMatches[0]);
                    setOpen(false);
                }
                else if (exactMatches.length > 1)
                {
                    setSelected(exactMatches[0]);
                    onValueChange?.(exactMatches[0]);
                    setOpen(false);
                }
            }

            if (event.key === "Escape")
            {
                input.blur();
            }
        },
        [isOpen, options, onValueChange, searchKeys],
    );

    const handleBlur = useCallback(() =>
    {
        setOpen(false);
        setInputValue(selected?.label ?? "");
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
                    onValueChange={setInputValue}
                    onBlur={handleBlur}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(className, "pr-8 capitalize")}
                    bordered={inputBordered}
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
                        "absolute top-0 z-10 w-full rounded-xl border border-input bg-background shadow outline-none animate-in fade-in-0 zoom-in-95",
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
                            {!isLoading && filteredOptions.length > 0 && (
                                <CommandGroup>
                                    {filteredOptions.map((option) =>
                                    {
                                        const isSelected =
												selected?.value ===
												option.value;
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={searchKeys
                                                    .map((key) => option[key])
                                                    .join(" ")}
                                                onMouseDown={(event) =>
                                                {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                }}
                                                onSelect={() => handleSelectOption(option)
                                                }
                                                className={cn(
                                                    "flex w-full items-center gap-2",
                                                    !isSelected ? "pl-8" : null,
                                                )}
                                            >
                                                {renderOption ? (
                                                    renderOption(
                                                        option,
                                                        isSelected,
                                                    )
                                                ) : (
                                                    <>
                                                        {isSelected && (
                                                            <Check className="w-4" />
                                                        )}
                                                        {option.label}
                                                    </>
                                                )}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                            {!isLoading && filteredOptions.length === 0 && (
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
