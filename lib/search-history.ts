import { supabase } from "@/lib/supabase"

export interface SearchQuery {
  id: string
  user_id: string
  text: string
  timestamp: number
  is_complex: boolean
  categories: string[]
  delete_at: number | null
  manually_preserved: boolean
  search_mode: "sonar" | "sonar-reasoning"
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
  const categories = new Set<string>()

  // Technology-specific patterns
  const patterns = {
    "Programming Languages": [
      /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|go|rust|swift|kotlin|scala|r|matlab|perl|haskell|elixir|clojure|dart|lua)\b/i,
      /\b(programming language|framework|library)\b/i,
    ],
    "Web Development": [
      /\b(react|angular|vue|next\.js|express|django|flask|laravel|spring|node\.js|html|css|javascript|typescript)\b/i,
      /\b(web development|frontend|backend|fullstack|api|rest|graphql)\b/i,
    ],
    "DevOps & Cloud": [
      /\b(docker|kubernetes|aws|azure|gcp|ci\/cd|jenkins|gitlab|github actions|terraform|ansible)\b/i,
      /\b(devops|cloud computing|infrastructure|deployment|scaling)\b/i,
    ],
    "AI & Machine Learning": [
      /\b(ai|machine learning|deep learning|neural network|tensorflow|pytorch|scikit-learn|numpy|pandas)\b/i,
      /\b(artificial intelligence|data science|ml model|training|inference)\b/i,
    ],
    "Cybersecurity": [
      /\b(security|encryption|authentication|authorization|firewall|vulnerability|penetration testing)\b/i,
      /\b(cybersecurity|hacking|malware|ransomware|phishing|ddos)\b/i,
    ],
    "Database": [
      /\b(mysql|postgresql|mongodb|redis|cassandra|elasticsearch|sqlite|oracle|sql server)\b/i,
      /\b(database|data storage|query|schema|indexing|sharding)\b/i,
    ],
    "Mobile Development": [
      /\b(ios|android|react native|flutter|swift|kotlin|mobile app|native app)\b/i,
      /\b(mobile development|app development|cross-platform|hybrid app)\b/i,
    ],
    "System Architecture": [
      /\b(microservices|monolithic|distributed system|load balancing|high availability)\b/i,
      /\b(architecture|design pattern|scalability|performance optimization)\b/i,
    ],
    "Blockchain": [
      /\b(blockchain|bitcoin|ethereum|smart contract|cryptocurrency|web3|defi)\b/i,
      /\b(distributed ledger|mining|wallet|token|nft)\b/i,
    ],
    "Hardware & IoT": [
      /\b(arduino|raspberry pi|iot|embedded system|microcontroller|sensor)\b/i,
      /\b(hardware|electronics|circuit|prototype|maker)\b/i,
    ],
  }

  // Check query and answer against patterns
  const textToCheck = `${query} ${answer}`.toLowerCase()
  
  for (const [category, regexPatterns] of Object.entries(patterns)) {
    if (regexPatterns.some(pattern => pattern.test(textToCheck))) {
      categories.add(category)
    }
  }

  // Add complexity category if query is complex
  if (analyzeQueryComplexity(query)) {
    categories.add("Complex Query")
  }

  // Add "General" if no specific categories matched
  if (categories.size === 0) {
    categories.add("General")
  }

  return Array.from(categories)
}

// Save a search query to history
export async function saveSearchQuery(query: string, searchMode: "sonar" | "sonar-reasoning"): Promise<void> {
  try {
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log("User not authenticated, not saving search history")
      return
    }

    const userId = session.user.id

    // Analyze query complexity
    const isComplex = analyzeQueryComplexity(query)

    // Determine categories
    const categories = determineCategories(query, "")

    // Calculate deletion time (24 hours for simple queries, null for complex)
    const deleteAt = isComplex ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Create new search entry
    const { error } = await supabase.from("search_history").insert({
      user_id: userId,
      text: query,
      is_complex: isComplex,
      categories,
      delete_at: deleteAt,
      manually_preserved: false,
      search_mode: searchMode,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error saving search query:", error)
  }
}

// Get the full search history
export async function getSearchHistory(): Promise<SearchQuery[]> {
  try {
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log("User not authenticated, returning empty search history")
      return []
    }

    const userId = session.user.id

    // Get search history for the current user
    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error retrieving search history:", error)
    return []
  }
}

// Toggle the preservation status of a search
export async function toggleSearchPreservation(id: string): Promise<void> {
  try {
    // Get the current search item
    const { data, error: fetchError } = await supabase
      .from("search_history")
      .select("manually_preserved, is_complex, timestamp")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const preserved = !data.manually_preserved
    const deleteAt = preserved
      ? null
      : data.is_complex
        ? null
        : new Date(data.timestamp + 24 * 60 * 60 * 1000).toISOString()

    // Update the search item
    const { error: updateError } = await supabase
      .from("search_history")
      .update({
        manually_preserved: preserved,
        delete_at: deleteAt,
      })
      .eq("id", id)

    if (updateError) {
      throw updateError
    }
  } catch (error) {
    console.error("Error toggling search preservation:", error)
  }
}

// Delete a specific search by ID
export async function deleteSearch(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("search_history").delete().eq("id", id)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error deleting search:", error)
  }
}

// Clean up expired searches
export async function cleanupExpiredSearches(): Promise<void> {
  try {
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return
    }

    const userId = session.user.id
    const now = new Date().toISOString()

    // Delete expired searches
    const { error } = await supabase
      .from("search_history")
      .delete()
      .eq("user_id", userId)
      .lt("delete_at", now)
      .eq("manually_preserved", false)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error cleaning up expired searches:", error)
  }
}

// Get time remaining until deletion (in milliseconds)
export function getTimeUntilDeletion(query: SearchQuery): number | null {
  if (!query.delete_at || query.manually_preserved) return null

  const deleteAtTime = new Date(query.delete_at).getTime()
  const timeRemaining = deleteAtTime - Date.now()
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

