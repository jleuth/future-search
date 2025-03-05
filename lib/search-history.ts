export interface SearchQuery {
  id: string
  text: string
  timestamp: number
  isComplex: boolean
  categories: string[]
  deleteAt: number | null
  manuallyPreserved: boolean
  searchMode: "sonar" | "sonar-reasoning"
}

// Analyze query complexity based on various factors
export function analyzeQueryComplexity(query: string): boolean {
  // Check for advanced search operators
  const hasAdvancedOperators = /(".*?"|site:|filetype:|OR|AND|-|intitle:)/i.test(query)

  // Check for multiple keywords (more than 3 significant words)
  const significantWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 && !["the", "and", "for", "with", "what", "when", "where", "how", "why", "who"].includes(word),
    )

  const hasMultipleKeywords = significantWords.length > 3

  // Check for question complexity (contains multiple question words or complex structure)
  const questionWords = ["what", "when", "where", "how", "why", "who", "which"]
  const questionWordCount = questionWords.filter((word) => query.toLowerCase().includes(word)).length
  const hasComplexQuestion = questionWordCount > 1 || query.length > 60

  // A query is complex if it meets any of these criteria
  return hasAdvancedOperators || hasMultipleKeywords || hasComplexQuestion
}

// Export the determineCategories function
export function determineCategories(query: string, answer: string): string[] {
  const combinedText = (query + " " + answer).toLowerCase()

  const categoryMatches = [
    { keywords: ["history", "historical", "ancient", "century", "war", "dynasty"], category: "History" },
    { keywords: ["science", "scientific", "physics", "chemistry", "biology", "experiment"], category: "Science" },
    { keywords: ["technology", "tech", "computer", "software", "hardware", "digital"], category: "Technology" },
    { keywords: ["health", "medical", "medicine", "disease", "treatment", "symptom"], category: "Health" },
    { keywords: ["business", "economy", "financial", "market", "company", "stock"], category: "Business" },
    { keywords: ["politics", "government", "policy", "election", "president", "democracy"], category: "Politics" },
    { keywords: ["art", "culture", "music", "film", "literature", "painting"], category: "Arts & Culture" },
    { keywords: ["sports", "game", "athlete", "team", "championship", "olympic"], category: "Sports" },
  ]

  const matchedCategories = categoryMatches
    .filter(({ keywords }) => keywords.some((keyword) => combinedText.includes(keyword)))
    .map(({ category }) => category)

  // Add "Factual Information" for queries that seem to be seeking facts
  if (
    combinedText.includes("what is") ||
    combinedText.includes("how to") ||
    combinedText.includes("when did") ||
    combinedText.includes("where is")
  ) {
    matchedCategories.push("Factual Information")
  }

  // Limit to 4 categories and ensure at least one
  return matchedCategories.slice(0, 4).length > 0 ? matchedCategories.slice(0, 4) : ["General Knowledge"]
}

// Save a search query to history
export function saveSearchQuery(query: string, searchMode: "sonar" | "sonar-reasoning"): void {
  if (typeof window === "undefined") return

  try {
    // Get existing history
    const history = getSearchHistory()

    // Analyze query complexity
    const isComplex = analyzeQueryComplexity(query)

    // Determine categories (now using the local function)
    const categories = determineCategories(query, "")

    // Calculate deletion time (24 hours for simple queries, null for complex)
    const deleteAt = isComplex ? null : Date.now() + 24 * 60 * 60 * 1000

    // Create new search entry
    const newSearch: SearchQuery = {
      id: Date.now().toString(),
      text: query,
      timestamp: Date.now(),
      isComplex,
      categories,
      deleteAt,
      manuallyPreserved: false,
      searchMode,
    }

    // Add to history and save
    history.unshift(newSearch)
    localStorage.setItem("searchHistory", JSON.stringify(history))

    // Clean up expired entries
    cleanupExpiredSearches()
  } catch (error) {
    console.error("Error saving search query:", error)
  }
}

// Get the full search history
export function getSearchHistory(): SearchQuery[] {
  if (typeof window === "undefined") return []

  try {
    const history = localStorage.getItem("searchHistory")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Error retrieving search history:", error)
    return []
  }
}

// Toggle the preservation status of a search
export function toggleSearchPreservation(id: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getSearchHistory()
    const updatedHistory = history.map((item) => {
      if (item.id === id) {
        const preserved = !item.manuallyPreserved
        return {
          ...item,
          manuallyPreserved: preserved,
          deleteAt: preserved ? null : item.isComplex ? null : item.timestamp + 24 * 60 * 60 * 1000,
        }
      }
      return item
    })

    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error toggling search preservation:", error)
  }
}

// Delete a specific search by ID
export function deleteSearch(id: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getSearchHistory()
    const updatedHistory = history.filter((item) => item.id !== id)
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error deleting search:", error)
  }
}

// Clean up expired searches
export function cleanupExpiredSearches(): void {
  if (typeof window === "undefined") return

  try {
    const history = getSearchHistory()
    const now = Date.now()

    const updatedHistory = history.filter((item) => !item.deleteAt || item.deleteAt > now || item.manuallyPreserved)

    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error cleaning up expired searches:", error)
  }
}

// Get time remaining until deletion (in milliseconds)
export function getTimeUntilDeletion(query: SearchQuery): number | null {
  if (!query.deleteAt || query.manuallyPreserved) return null

  const timeRemaining = query.deleteAt - Date.now()
  return timeRemaining > 0 ? timeRemaining : 0
}

// Format time remaining in a human-readable format
export function formatTimeRemaining(ms: number | null): string {
  if (ms === null) return "Never"
  if (ms <= 0) return "Imminent"

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

