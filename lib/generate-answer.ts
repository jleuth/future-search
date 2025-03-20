import { determineCategories } from "./search-history"

export async function generateAnswer(query: string, searchMode: "sonar" | "sonar-reasoning") {
  try {
    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    
    console.log("Making request to Perplexity API with:", {
      url: `${baseUrl}/api/perplexity`,
      query,
      searchMode,
    })
    
    // Call our secure proxy endpoint instead of directly using the Perplexity API
    const response = await fetch(`${baseUrl}/api/perplexity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        searchMode,
      }),
      credentials: "include", // Include cookies for authentication
    })

    console.log("Perplexity API response status:", response.status)
    const data = await response.json()
    console.log("Perplexity API response data:", data)

    if (!response.ok) {
      throw new Error(data.error || `Failed to generate answer (Status: ${response.status})`)
    }

    // Use the determineCategories function from search-history.ts
    const categories = determineCategories(query, data.answer)

    return {
      answer: data.answer,
      sources: data.sources,
      categories,
      searchMode,
      error: null,
    }
  } catch (error: any) {
    console.error("Error generating answer:", {
      error: error.message,
      stack: error.stack,
      query,
      searchMode,
    })
    return {
      answer: "",
      sources: [],
      categories: ["Error"],
      searchMode,
      error: error.message || "An unexpected error occurred. Please try again later.",
    }
  }
}

