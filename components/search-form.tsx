"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveSearchQuery } from "@/lib/search-history"
import { Autocomplete } from "@/components/autocomplete"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-context"

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchMode, setSearchMode] = useState<"sonar" | "sonar-reasoning">("sonar")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsSearching(true)

      // Save the search query to history before navigating if user is logged in
      if (user) {
        await saveSearchQuery(query.trim(), searchMode)
      }

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

        <div className="absolute right-0 top-0 h-full flex items-center ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-half px-2 text-muted-foreground transition-colors duration-300">
                {searchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
            >
              <DropdownMenuItem onClick={() => setSearchMode("sonar")}>Sonar</DropdownMenuItem>
              <DropdownMenuLabel className="text-xs text-gray-500">
                Faster and cheaper, but possibly less accurate
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSearchMode("sonar-reasoning")}>Sonar Reasoning</DropdownMenuItem>
              <DropdownMenuLabel className="text-xs text-gray-500">
                Slower and more expensive, but more accurate
              </DropdownMenuLabel>
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
        <div className="absolute -bottom-10 left-0 w-full text-center text-xs text-muted-foreground animate-fade-in">
          <p className="mb-1">Press Enter to search</p>
        </div>
      )}

      <Autocomplete query={query} onSuggestionClick={handleSuggestionClick} />
    </form>
  )
}

