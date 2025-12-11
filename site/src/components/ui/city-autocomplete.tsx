"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface City {
    id: string
    name: string
    slug: string
}

interface CityAutocompleteProps {
    regionId: string | null
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}


export function CityAutocomplete({
    regionId,
    value,
    onChange,
    placeholder = "Start typing city name...",
    disabled = false
}: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<City[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        if (!regionId || inputValue.length < 2) {
            setSuggestions([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true)
            try {
                const { searchCities } = await import("@/lib/actions/location")
                const results = await searchCities(regionId, inputValue)
                setSuggestions(results)
                setIsOpen(results.length > 0)
            } catch (error) {
                console.error("Error searching cities:", error)

                if (error instanceof Error) {
                    if (error.message.includes('network')) {
                        toast.error("Connection issue", {
                            description: "Having trouble connecting to our location service. Please try again."
                        })
                    } else if (error.message.includes('timeout')) {
                        toast.error("Search timeout", {
                            description: "The search is taking too long. Please try again."
                        })
                    } else {
                        toast.error("Search unavailable", {
                            description: "We couldn't search for cities at the moment. Please try again."
                        })
                    }
                } else {
                    toast.error("Search unavailable", {
                        description: "We couldn't search for cities at the moment. Please try again."
                    })
                }

                setSuggestions([])
            } finally {
                setIsLoading(false)
            }
        }, 300) // Debounce

        return () => clearTimeout(timeoutId)
    }, [inputValue, regionId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        setHighlightedIndex(-1)
    }

    const handleSelectCity = (city: City) => {
        setInputValue(city.name)
        onChange(city.name)
        setIsOpen(false)
        setSuggestions([])
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case "ArrowUp":
                e.preventDefault()
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
                break
            case "Enter":
                e.preventDefault()
                if (highlightedIndex >= 0) {
                    handleSelectCity(suggestions[highlightedIndex])
                }
                break
            case "Escape":
                setIsOpen(false)
                break
        }
    }

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            setIsOpen(false)
            // If user typed something but didn't select, keep it
            if (inputValue && inputValue !== value) {
                onChange(inputValue)
            }
        }, 200)
    }

    return (
        <div className="relative">
            <div className="relative">
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    onBlur={handleBlur}
                    placeholder={disabled ? "Select province first" : placeholder}
                    disabled={disabled}
                    className={cn(disabled && "bg-slate-100 cursor-not-allowed")}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {suggestions.map((city, index) => (
                        <li
                            key={city.id}
                            className={cn(
                                "px-3 py-2 cursor-pointer text-sm",
                                highlightedIndex === index
                                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                            onClick={() => handleSelectCity(city)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {city.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
