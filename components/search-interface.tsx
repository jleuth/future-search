"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Search, Code, Brain, Database, Cloud, Shield } from "lucide-react"

interface SearchInterfaceProps {
  onSearch: (query: string, searchMode: "sonar" | "sonar-reasoning") => void
  isLoading?: boolean
}

export function SearchInterface({ onSearch, isLoading = false }: SearchInterfaceProps) {
  const [query, setQuery] = useState("")
  const [searchMode, setSearchMode] = useState<"sonar" | "sonar-reasoning">("sonar")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), searchMode)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about programming, development, or technology..."
            className="w-full pl-12 pr-4 py-6 text-lg bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={searchMode === "sonar" ? "default" : "outline"}
            onClick={() => setSearchMode("sonar")}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Quick Search
          </Button>
          <Button
            type="button"
            variant={searchMode === "sonar-reasoning" ? "default" : "outline"}
            onClick={() => setSearchMode("sonar-reasoning")}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Detailed Analysis
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/user/api-keys")}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Manage API Key
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            Code Examples
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Best Practices
          </span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            Cloud & DevOps
          </span>
        </div>
      </form>
    </div>
  )
} 