import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Source {
  url: string
}

export function SourceCitation({ source }: { source: Source }) {
  return (
    <Card>
      <CardContent className="pt-6">
         <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          {new URL(source.url).hostname}
        </a>
      </CardContent>
    </Card>
  )
}

