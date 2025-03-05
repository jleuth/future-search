"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Autocomplete({
  query,
  onSuggestionClick,
}: { query: string; onSuggestionClick: (suggestion: string) => void }) {
  const [debouncedQuery] = useDebounce(query, 300)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const { data, error } = useSWR(
    debouncedQuery.length > 2 ? `/api/suggestions?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
  )

  useEffect(() => {
    if (data) {
      setSuggestions(data.suggestions)
    }
  }, [data])

  if (!debouncedQuery || debouncedQuery.length <= 2 || !suggestions.length) return null

  return (
    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors duration-150"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  )
}

