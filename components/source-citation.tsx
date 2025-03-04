import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Source {
  url: string
}

export function SourceCitation({ source }: { source: Source }) {
  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 opacity-0 animate-fade-in">
      <CardContent className="pt-6">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors duration-300"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="truncate">{new URL(source.url).hostname}</span>
        </a>
      </CardContent>
    </Card>
  )
}

