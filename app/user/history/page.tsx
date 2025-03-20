"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Filter,
  Search,
  Trash2,
  HistoryIcon,
  Star,
  StarOff,
  ArrowUpRight,
  X,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getSearchHistory,
  toggleSearchPreservation,
  deleteSearch,
  cleanupExpiredSearches,
  formatTimeRemaining,
  getTimeUntilDeletion,
  type SearchQuery,
} from "@/lib/search-history"
import { HeaderNav } from "@/components/header-nav"
import { useAuth } from "@/components/auth/auth-context"

export default function HistoryPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([])
  const [filterText, setFilterText] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsPageLoading(false)
      }
    }
  }, [authLoading, user, router])

  // Load search history and update available categories
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        await cleanupExpiredSearches()
        const history = await getSearchHistory()
        setSearchHistory(history)

        // Extract all unique categories
        const categories = new Set<string>()
        history.forEach((item) => {
          item.categories.forEach((category) => categories.add(category))
        })
        setAvailableCategories(Array.from(categories))

        if (!isLoaded) {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Error loading search history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadHistory()
    }

    // Set up interval to refresh time remaining
    const interval = setInterval(() => {
      if (user) loadHistory()
    }, 60000)

    return () => clearInterval(interval)
  }, [isLoaded, user])

  // Filter history based on current filters
  const filteredHistory = searchHistory.filter((item) => {
    // Text filter
    const matchesText = filterText === "" || item.text.toLowerCase().includes(filterText.toLowerCase())

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || item.categories.some((cat) => selectedCategories.includes(cat))

    // Tab filter
    if (activeTab === "complex") {
      return matchesText && matchesCategory && item.is_complex
    } else if (activeTab === "simple") {
      return matchesText && matchesCategory && !item.is_complex
    } else if (activeTab === "preserved") {
      return matchesText && matchesCategory && item.manually_preserved
    } else if (activeTab === "expiring") {
      return matchesText && matchesCategory && item.delete_at !== null && !item.manually_preserved
    } else {
      return matchesText && matchesCategory
    }
  })

  // Handle toggling preservation status
  const handleTogglePreservation = async (id: string) => {
    await toggleSearchPreservation(id)
    const history = await getSearchHistory()
    setSearchHistory(history)
  }

  // Handle deleting a search
  const handleDeleteSearch = async (id: string) => {
    await deleteSearch(id)
    const history = await getSearchHistory()
    setSearchHistory(history)
  }

  // Handle repeating a search
  const handleRepeatSearch = (query: string, mode: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&mode=${mode}`)
  }

  // Toggle a category in the filter
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  if (authLoading || isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-pattern">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <a className="flex items-center space-x-2" href="/">
              <span className="font-bold text-xl gradient-text">Seekup</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <HeaderNav currentPage="history" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold mb-2 gradient-text">Search History</h1>
            <p className="text-muted-foreground">
              View and manage your past searches. Simple searches are automatically deleted after 24 hours.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-secondary/50 backdrop-blur-sm">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="complex"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    Complex
                  </TabsTrigger>
                  <TabsTrigger
                    value="simple"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    Simple
                  </TabsTrigger>
                  <TabsTrigger
                    value="preserved"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    Preserved
                  </TabsTrigger>
                  <TabsTrigger
                    value="expiring"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    Expiring
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter searches..."
                    className="pl-8 w-full bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/50"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  {filterText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setFilterText("")}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear</span>
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter categories</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card/90 backdrop-blur-lg border-primary/20">
                    {availableCategories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        className="hover:bg-primary/10"
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 hover:bg-primary/10"
                        onClick={() => setSelectedCategories([])}
                      >
                        Clear filters
                      </Button>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <span className="text-sm text-muted-foreground">Filtered by:</span>
                {selectedCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/10 text-primary-foreground"
                  >
                    {category}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => toggleCategory(category)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {category} filter</span>
                    </Button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 hover:bg-primary/10"
                  onClick={() => setSelectedCategories([])}
                >
                  Clear all
                </Button>
              </div>
            )}

            {filteredHistory.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 mb-4 animate-pulse-slow">
                  <HistoryIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 gradient-text">No search history found</h3>
                <p className="text-muted-foreground text-base max-w-md">
                  {filterText || selectedCategories.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "Your search history will appear here once you start searching."}
                </p>
                {(filterText || selectedCategories.length > 0) && (
                  <Button
                    variant="outline"
                    className="mt-6 border-primary/20 bg-primary/10 hover:bg-primary/20"
                    onClick={() => {
                      setFilterText("")
                      setSelectedCategories([])
                      setActiveTab("all")
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 stagger-animation">
                {filteredHistory.map((item) => {
                  const timeRemaining = getTimeUntilDeletion(item)
                  const formattedTime = formatTimeRemaining(timeRemaining)

                  return (
                    <Card
                      key={item.id}
                      className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300 opacity-0 animate-fade-in"
                    >
                      <CardHeader className="pb-2 border-b border-border/40 bg-secondary/30">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium line-clamp-1 flex items-center">
                            {item.is_complex && <Sparkles className="h-4 w-4 text-primary mr-2" />}
                            {item.text}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 border-primary/20">
                              {item.search_mode === "sonar" ? "Sonar" : "Sonar Reasoning"}
                            </Badge>
                            {item.is_complex ? (
                              <Badge variant="default" className="bg-primary/80">
                                Complex
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-secondary/80">
                                Simple
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2 pt-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.categories.map((category) => (
                            <Badge key={category} variant="outline" className="bg-primary/10 border-primary/20">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(item.timestamp).toLocaleString()}

                          {timeRemaining !== null && (
                            <div className="ml-4 flex items-center">
                              <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                              <span className={timeRemaining < 3600000 ? "text-destructive" : ""}>
                                Deletes in {formattedTime}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between border-t border-border/40 bg-secondary/20">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePreservation(item.id)}
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            {item.manually_preserved ? (
                              <>
                                <StarOff className="h-4 w-4 mr-1" />
                                Unpreserve
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-1" />
                                Preserve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSearch(item.id)}
                            className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleRepeatSearch(item.text, item.search_mode)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Search Again
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

