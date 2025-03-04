import { Search, Sparkles } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in">
      <div className="relative">
        <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 animate-pulse-slow">
          <Search className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-5 w-5 text-primary animate-float" />
        </div>
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-medium gradient-text">Discover Anything</h3>
        <p className="text-muted-foreground text-base">
          Enter a search query to get started. You can ask questions, search for information, or even enter a website
          URL.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 w-full max-w-lg stagger-animation">
        {[
          "How does AI work?",
          "Latest space discoveries",
          "Climate change solutions",
          "Quantum computing explained",
          "Best coding practices",
          "Future technology trends",
        ].map((suggestion, index) => (
          <div
            key={index}
            className="text-sm bg-secondary/50 backdrop-blur-sm px-3 py-2 rounded-lg text-center cursor-pointer hover:bg-primary/20 transition-colors duration-300 opacity-0 animate-fade-in"
          >
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  )
}

