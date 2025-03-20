import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/server-encryption"
import { createPerplexity } from "@ai-sdk/perplexity"
import { generateText } from "ai"

// Proxy for Perplexity API calls
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's encrypted API key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("encrypted_key, iv, tag")
      .eq("user_id", user.id)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json(
        {
          error: "API key not found",
          answer: "Please add your Perplexity API key in the API Keys section to use this feature.",
          sources: [],
        },
        { status: 404 },
      )
    }

    // Decrypt the API key
    let apiKey
    try {
      apiKey = decrypt(keyData.encrypted_key, keyData.iv, keyData.tag)
    } catch (error) {
      console.error("Decryption error:", error)
      return NextResponse.json(
        {
          error: "Failed to decrypt API key",
          answer: "There was an error with your API key. Please try updating it in the API Keys section.",
          sources: [],
        },
        { status: 500 },
      )
    }

    // Get request parameters
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          answer: "There was an error processing your request. Please try again.",
          sources: [],
        },
        { status: 400 },
      )
    }

    const { query, searchMode } = requestData

    if (!query) {
      return NextResponse.json(
        {
          error: "Query is required",
          answer: "Please provide a search query.",
          sources: [],
        },
        { status: 400 },
      )
    }

    // Get current date and time
    let dateTime
    try {
      const response = await fetch("https://timeapi.io/api/time/current/zone?timeZone=UTC")
      if (!response.ok) {
        throw new Error("Failed to fetch current time")
      }
      const timeData = await response.json()
      dateTime = timeData.dateTime
    } catch (error) {
      // Use current time as fallback
      dateTime = new Date().toISOString()
    }

    // Initialize Perplexity with the decrypted API key
    const perplexity = createPerplexity({
      apiKey,
    })

    const searchPrompt = `You are an expert technology researcher and developer. Your task is to provide comprehensive, accurate, and up-to-date information about technology topics, with a focus on:

1. Programming and Development
   - Programming languages, frameworks, and tools
   - Best practices and design patterns
   - Code examples and implementation details
   - Performance optimization and debugging

2. System Architecture and Infrastructure
   - Cloud computing and distributed systems
   - Microservices and containerization
   - Database design and optimization
   - System security and reliability

3. Emerging Technologies
   - Artificial Intelligence and Machine Learning
   - Blockchain and Web3
   - IoT and embedded systems
   - Mobile and cross-platform development

For each response:
1. Start with a clear, concise answer
2. Include relevant code examples when applicable
3. Provide practical implementation details
4. Reference official documentation and best practices
5. Include performance considerations and trade-offs
6. Add security considerations where relevant

Format your response with:
- Clear headings and sections
- Code blocks with language specification
- Bullet points for key takeaways
- Links to official documentation
- Version-specific information when relevant

Query: ${query}

${searchMode === "sonar-reasoning" ? "Please provide detailed reasoning steps and implementation details." : "Please provide a concise, direct answer."}`

    try {
      // Generate answer using Perplexity
      const { text, sources } = await generateText({
        model: perplexity(searchMode || "sonar"),
        prompt: searchPrompt,
        system: `You are an AI web search assistant, helping users with tech-focused and general knowledge questions. The current time and date is ${dateTime}`,
      })

      // Format sources
      const formattedSources =
        sources?.map((source) => ({
          url: source.url,
        })) || []

      return NextResponse.json({
        answer: text,
        sources: formattedSources,
      })
    } catch (error: any) {
      console.error("Perplexity API error:", error)
      return NextResponse.json(
        {
          error: error.message || "Failed to generate answer",
          answer:
            "I'm sorry, I couldn't generate an answer at this time. Please check your API key and try again later.",
          sources: [],
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error calling Perplexity API:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        answer: "I'm sorry, I couldn't generate an answer at this time. Please try again later.",
        sources: [],
      },
      { status: 500 },
    )
  }
}

