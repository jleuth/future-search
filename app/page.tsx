import { SearchForm } from "@/components/search-form"
import { EmptyState } from "@/components/empty-state"
import { HeaderNav } from "@/components/header-nav"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-pattern">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <a className="flex items-center space-x-2" href="/">
              <span className="font-bold text-xl gradient-text">Seekup</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <HeaderNav currentPage="search" />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container flex flex-col items-center justify-center space-y-10 py-16 md:py-24">
          <div className="mx-auto flex w-full flex-col items-center space-y-5 md:w-2/3 animate-fade-in">
            <h1 className="text-center text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
              What can I show you?
            </h1>
            <p className="text-center text-muted-foreground md:text-xl max-w-2xl">
              Ask any question and get accurate, sourced answers in seconds
            </p>
          </div>
          <div className="w-full max-w-2xl px-4 md:px-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <SearchForm />
          </div>
          <EmptyState />
        </div>
      </main>
    </div>
  )
}

