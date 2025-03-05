import { createPerplexity } from "@ai-sdk/perplexity"
import { generateText } from "ai"
import { determineCategories } from "./search-history"

export async function generateAnswer(query: string, searchMode: "sonar" | "sonar-reasoning") {
  const perplexity = createPerplexity({
    apiKey: process.env.PPLX_API,
  })

  try {
    const response = await fetch("https://timeapi.io/api/time/current/zone?timeZone=UTC")
    const data = await response.json()
    const dateTime = data.dateTime // Extract the dateTime

    console.log("Got date and time:" + dateTime)

    // Use Perplexity to generate an answer with sources
    const { text, sources } = await generateText({
      model: perplexity(searchMode),
      prompt: query,
      // This system prompt helps categorize the answer
      system: `You are an AI web search assistant, helping users with tech-focused and general knowledge questions. The current time and date is ${dateTime}`,
    })

    // Extract sources from the Perplexity response
    const formattedSources =
      sources?.map((source) => ({
        url: source.url,
      })) || []

    // Use the determineCategories function from search-history.ts
    const categories = determineCategories(query, text)

    return {
      answer: text,
      sources: formattedSources,
      categories,
      searchMode,
    }
  } catch (error) {
    console.error("Error generating answer:", error)
    return {
      answer: "I'm sorry, I couldn't generate an answer at this time. Please try again later.",
      sources: [],
      categories: ["Error"],
      searchMode,
    }
  }
}

