import type React from "react"
import { generateAnswer } from "@/lib/generate-answer"
import { SourceCitation } from "@/components/source-citation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ThinkDropdown } from "@/components/think-dropdown"

const CustomMarkdownComponents = {
  think: ({ children }: { children: React.ReactNode }) => <ThinkDropdown>{children}</ThinkDropdown>,
}

export async function SearchResults({ query, searchMode }: { query: string; searchMode: "sonar" | "sonar-reasoning" }) {
  const { answer, sources, categories, searchMode: usedSearchMode } = await generateAnswer(query, searchMode)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold mb-2 gradient-text">{query}</h1>
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          {usedSearchMode === "sonar" ? "Sonar" : "Sonar Reasoning"}
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
            <ReactMarkdown components={CustomMarkdownComponents}>{answer}</ReactMarkdown>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t border-border/40 pt-4 bg-secondary/20">
          <div className="flex flex-wrap gap-2 stagger-animation">
            {categories.map((category, index) => (
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
          {sources.map((source, index) => (
            <SourceCitation key={index} source={source} />
          ))}
        </div>
      </div>
    </div>
  )
}

