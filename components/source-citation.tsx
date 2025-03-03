import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Source {
  title: string
  url: string
  snippet: string
}

export function SourceCitation({ source }: { source: Source }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-2 line-clamp-1">{source.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{source.snippet}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          {new URL(source.url).hostname}
        </a>
      </CardFooter>
    </Card>
  )
}

