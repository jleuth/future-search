import { generateAnswer } from "@/lib/generate-answer"
import { SourceCitation } from "@/components/source-citation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export async function SearchResults({ query }: { query: string }) {
  const { answer, sources, categories } = await generateAnswer(query)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold mb-2 gradient-text">{query}</h1>
        <p className="text-sm text-muted-foreground">Showing results based on web search and AI analysis</p>
      </div>

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
            {answer.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="mb-4 leading-relaxed animate-fade-in"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                {paragraph}
              </p>
            ))}
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

