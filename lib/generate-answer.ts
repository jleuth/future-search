import { createPerplexity } from "@ai-sdk/perplexity"
import { generateText } from "ai"
import { determineCategories } from "./search-history"

export async function generateAnswer(query: string) {
  const perplexity = createPerplexity({
    apiKey: process.env.PPLX_API,
  })

  try {
    // Use Perplexity to generate an answer with sources
    const { text, sources, providerMetadata } = await generateText({
      model: perplexity("sonar-pro"),
      prompt: query,
      // This system prompt helps categorize the answer
      system: `You are an AI assistant that provides accurate, well-structured answers with proper citations.
      For each answer, identify 2-4 relevant categories that best describe the query's domain or intent.
      Always provide comprehensive answers with factual information.`,
    })

    // Extract sources from the Perplexity response
    const formattedSources =
      sources?.map((source) => ({
        title: source.title || "Untitled Source",
        url: source.url,
        snippet: source.snippet || "No preview available",
      })) || []

    // Use the determineCategories function from search-history.ts
    const categories = determineCategories(query, text)

    return {
      answer: text,
      sources: formattedSources,
      categories,
    }
  } catch (error) {
    console.error("Error generating answer:", error)
    return {
      answer: "I'm sorry, I couldn't generate an answer at this time. Please try again later.",
      sources: [],
      categories: ["Error"],
    }
  }
}

