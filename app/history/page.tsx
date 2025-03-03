"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, Filter, Search, Trash2, HistoryIcon, Star, StarOff, ArrowUpRight, X } from "lucide-react"
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

export default function HistoryPage() {
  const router = useRouter()
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([])
  const [filterText, setFilterText] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Load search history and update available categories
  useEffect(() => {
    const loadHistory = () => {
      cleanupExpiredSearches()
      const history = getSearchHistory()
      setSearchHistory(history)

      // Extract all unique categories
      const categories = new Set<string>()
      history.forEach((item) => {
        item.categories.forEach((category) => categories.add(category))
      })
      setAvailableCategories(Array.from(categories))
    }

    loadHistory()

    // Set up interval to refresh time remaining
    const interval = setInterval(loadHistory, 60000)
    return () => clearInterval(interval)
  }, [])

  // Filter history based on current filters
  const filteredHistory = searchHistory.filter((item) => {
    // Text filter
    const matchesText = filterText === "" || item.text.toLowerCase().includes(filterText.toLowerCase())

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || item.categories.some((cat) => selectedCategories.includes(cat))

    // Tab filter
    if (activeTab === "complex") {
      return matchesText && matchesCategory && item.isComplex
    } else if (activeTab === "simple") {
      return matchesText && matchesCategory && !item.isComplex
    } else if (activeTab === "preserved") {
      return matchesText && matchesCategory && item.manuallyPreserved
    } else if (activeTab === "expiring") {
      return matchesText && matchesCategory && item.deleteAt !== null && !item.manuallyPreserved
    } else {
      return matchesText && matchesCategory
    }
  })

  // Handle toggling preservation status
  const handleTogglePreservation = (id: string) => {
    toggleSearchPreservation(id)
    setSearchHistory(getSearchHistory())
  }

  // Handle deleting a search
  const handleDeleteSearch = (id: string) => {
    deleteSearch(id)
    setSearchHistory(getSearchHistory())
  }

  // Handle repeating a search
  const handleRepeatSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  // Toggle a category in the filter
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="flex items-center space-x-2" href="/">
              <span className="font-bold">InsightEngine</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-full max-w-lg">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="bg-muted">
                  <HistoryIcon className="h-5 w-5" />
                  <span className="sr-only">History</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Search History</h1>
            <p className="text-muted-foreground">
              View and manage your past searches. Simple searches are automatically deleted after 24 hours.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="complex">Complex</TabsTrigger>
                  <TabsTrigger value="simple">Simple</TabsTrigger>
                  <TabsTrigger value="preserved">Preserved</TabsTrigger>
                  <TabsTrigger value="expiring">Expiring</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter searches..."
                    className="pl-8 w-full"
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
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter categories</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {availableCategories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
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
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Filtered by:</span>
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
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
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedCategories([])}>
                  Clear all
                </Button>
              </div>
            )}

            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <HistoryIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No search history found</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  {filterText || selectedCategories.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "Your search history will appear here once you start searching."}
                </p>
                {(filterText || selectedCategories.length > 0) && (
                  <Button
                    variant="outline"
                    className="mt-4"
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
              <div className="grid gap-4">
                {filteredHistory.map((item) => {
                  const timeRemaining = getTimeUntilDeletion(item)
                  const formattedTime = formatTimeRemaining(timeRemaining)

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium line-clamp-1">{item.text}</CardTitle>
                          <div className="flex items-center gap-1">
                            {item.isComplex ? (
                              <Badge variant="default">Complex</Badge>
                            ) : (
                              <Badge variant="secondary">Simple</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.categories.map((category) => (
                            <Badge key={category} variant="outline">
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
                      <CardFooter className="pt-2 flex justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleTogglePreservation(item.id)}>
                            {item.manuallyPreserved ? (
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
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSearch(item.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <Button variant="default" size="sm" onClick={() => handleRepeatSearch(item.text)}>
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

