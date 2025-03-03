import { SearchForm } from "@/components/search-form"
import { EmptyState } from "@/components/empty-state"
import { HeaderNav } from "@/components/header-nav"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="flex items-center space-x-2" href="/">
              <span className="font-bold">Seekup</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <HeaderNav currentPage="search" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center space-y-8 py-10 md:py-16">
          <div className="mx-auto flex w-full flex-col items-center space-y-4 md:w-2/3">
            <h1 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              What can I show you?
            </h1>
            <p className="text-center text-muted-foreground md:text-xl">
              Ask any question and get accurate, sourced answers in seconds
            </p>
          </div>
          <div className="w-full max-w-2xl px-4 md:px-0">
            <SearchForm />
          </div>
          <EmptyState />
        </div>
      </main>
    </div>
  )
}

