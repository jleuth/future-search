import { generateAnswer } from "@/lib/generate-answer"
import { SourceCitation } from "@/components/source-citation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export async function SearchResults({ query }: { query: string }) {
  const { answer, sources, categories } = await generateAnswer(query)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">{query}</h1>
        <p className="text-sm text-muted-foreground">Showing results based on web search and AI analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {answer.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Sources</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source, index) => (
            <SourceCitation key={index} source={source} />
          ))}
        </div>
      </div>
    </div>
  )
}

