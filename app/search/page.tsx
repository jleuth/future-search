import { Suspense } from "react"
import { redirect } from "next/navigation"
import { SearchForm } from "@/components/search-form"
import { SearchResults } from "@/components/search-results"
import { SearchSkeleton } from "@/components/search-skeleton"
import { HeaderNav } from "@/components/header-nav"

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q

  if (!query) {
    redirect("/")
  }

  // Check if the query is a URL
  const isUrl = (str: string) => {
    try {
      const url = new URL(str)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      // Check for common domain patterns without protocol
      const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      if (domainPattern.test(str)) {
        return true
      }
      return false
    }
  }

  // Redirect to the URL if the query is a URL
  if (isUrl(query)) {
    const url = query.startsWith("http") ? query : `https://${query}`
    redirect(url)
  }

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
            <div className="w-full max-w-lg">
              <SearchForm initialQuery={query} />
            </div>
            <HeaderNav currentPage="search" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

