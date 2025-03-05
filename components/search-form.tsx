"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveSearchQuery } from "@/lib/search-history"
import { Autocomplete } from "@/components/autocomplete"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchMode, setSearchMode] = useState<"sonar" | "sonar-reasoning">("sonar")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsSearching(true)
      // Save the search query to history before navigating
      saveSearchQuery(query.trim(), searchMode)

      // Add a small delay to show the animation
      setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}&mode=${searchMode}`)
      }, 800)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSubmit(new Event("submit") as unknown as React.FormEvent)
  }

  // Auto-focus the input on mount for better UX
  useEffect(() => {
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus()
    }
  }, [initialQuery])

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div
        className={`relative flex w-full items-center transition-all duration-300 ${isFocused ? "animate-glow" : ""}`}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask anything..."
          className={`pr-32 py-6 text-base transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/20 ${
            isFocused ? "border-primary/50 shadow-lg shadow-primary/20" : ""
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="absolute right-0 top-0 h-full flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-full px-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {searchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchMode("sonar")}>Sonar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchMode("sonar-reasoning")}>Sonar Reasoning</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isSearching ? (
            <div className="animate-pulse-slow px-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="h-full px-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              disabled={!query.trim()}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
        </div>
      </div>

      {isFocused && !isSearching && (
        <div className="absolute -bottom-20 left-0 w-full text-center text-xs text-muted-foreground animate-fade-in">
          <p className="mb-1">Press Enter to search</p>
          <p className="mb-1">Sonar: Faster and cheaper, but potentially less accurate.</p>
          <p>Sonar Reasoning: Slower and more expensive, but more accurate.</p>
        </div>
      )}

      <Autocomplete query={query} onSuggestionClick={handleSuggestionClick} />
    </form>
  )
}

