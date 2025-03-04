"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveSearchQuery } from "@/lib/search-history"

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsSearching(true)
      // Save the search query to history before navigating
      saveSearchQuery(query.trim())

      // Add a small delay to show the animation
      setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }, 800)
    }
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
          className={`pr-20 py-6 text-base transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/20 ${
            isFocused ? "border-primary/50 shadow-lg shadow-primary/20" : ""
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isSearching ? (
          <div className="absolute right-0 top-0 h-full px-3 flex items-center">
            <div className="animate-pulse-slow">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
        ) : (
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary transition-colors duration-300"
            disabled={!query.trim()}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}
      </div>

      {isFocused && !isSearching && (
        <div className="absolute -bottom-6 left-0 w-full text-center text-xs text-muted-foreground animate-fade-in">
          Press Enter to search
        </div>
      )}
    </form>
  )
}

