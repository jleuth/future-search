"use client"

import { generateAnswer } from "@/lib/generate-answer"
import { SourceCitation } from "@/components/source-citation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Key } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ThinkDropdown } from "@/components/think-dropdown"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  answer: string
  sources: Array<{ url: string }>
  categories: string[]
  searchMode: "sonar" | "sonar-reasoning"
  error: string | null
}

const extractContent = (text: string, tag: string) => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "gs")
  const matches = [...text.matchAll(regex)].map((match) => match[1])
  return matches.join("\n")
}

const removeContent = (text: string, tag: string) => {
  const regex = new RegExp(`<${tag}>.*?</${tag}>`, "gs")
  return text.replace(regex, "")
}

export function SearchResults({ query, searchMode }: { query: string; searchMode: "sonar" | "sonar-reasoning" }) {
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<Array<{ url: string }>>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Starting search with:", { query, searchMode })
        
        const result = await generateAnswer(query, searchMode)
        console.log("Search result:", result)

        if (result.error) {
          // Check for authentication errors
          if (result.error.toLowerCase().includes("unauthorized")) {
            setError("Please sign in to use the search feature. Redirecting to login...")
            // Redirect to login page after a short delay
            setTimeout(() => {
              router.push("/login")
            }, 2000)
            return
          }
          setError(result.error)
          return
        }

        setAnswer(result.answer)
        setSources(result.sources)
        setCategories(result.categories)
      } catch (err: any) {
        console.error("Error in SearchResults:", {
          error: err.message,
          stack: err.stack,
          query,
          searchMode,
        })
        setError(err.message || "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, searchMode, router])

  // Handle API key errors
  if (error?.includes("API key not found") || error?.includes("Failed to decrypt API key")) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold mb-2 gradient-text">{query}</h1>
          <Badge variant="outline" className="bg-primary/10 border-primary/20">
            {searchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
          </Badge>
        </div>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <Key className="h-4 w-4" />
          <AlertDescription>
            <p className="mb-2">You need to set up your Perplexity API key to use the search feature.</p>
            <Link href="/user/api-keys" className="text-primary hover:underline">
              Set up your API key →
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Handle other errors
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold mb-2 gradient-text">{query}</h1>
          <Badge variant="outline" className="bg-primary/10 border-primary/20">
            {searchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
          </Badge>
        </div>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const ReasoningSteps = extractContent(answer, "think")
  const FormattedAnswer = removeContent(answer, "think")

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold mb-2 gradient-text">{query}</h1>
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          {searchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">Showing results based on web search and AI analysis</p>

      <Card
        className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/5 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <CardHeader className="border-b border-border/40 bg-secondary/30">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse-slow" />
            <CardTitle className="text-lg">Answer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {searchMode === "sonar-reasoning" && (
              <>
                <ThinkDropdown>
                  <ReactMarkdown>{ReasoningSteps}</ReactMarkdown>
                </ThinkDropdown>
                <br />
              </>
            )}
            <ReactMarkdown>{FormattedAnswer}</ReactMarkdown>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t border-border/40 pt-4 bg-secondary/20">
          <div className="flex flex-wrap gap-2 stagger-animation">
            {categories.map((category: string) => (
              <Badge
                key={category}
                variant="secondary"
                className="bg-primary/10 text-primary-foreground hover:bg-primary/20 transition-colors duration-300 opacity-0 animate-fade-in"
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-medium gradient-text">Sources</h2>
        <div className="grid gap-4 md:grid-cols-2 stagger-animation">
          {sources.map((source: { url: string }, index: number) => (
            <SourceCitation key={index} source={source} />
          ))}
        </div>
      </div>
    </div>
  )
}

