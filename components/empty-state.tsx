import { Search } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="rounded-full bg-muted p-3">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">No search query</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Enter a search query to get started. You can ask questions, search for information, or even enter a website
          URL.
        </p>
      </div>
    </div>
  )
}

