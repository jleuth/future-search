import Link from "next/link"
import { Search, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeaderNav({ currentPage = "search" }: { currentPage?: "search" | "history" }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild={currentPage !== "search"}
        className={`transition-all duration-300 hover:bg-primary/20 ${currentPage === "search" ? "bg-primary/20 text-primary" : ""}`}
      >
        <Link href="/">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        asChild={currentPage !== "history"}
        className={`transition-all duration-300 hover:bg-primary/20 ${currentPage === "history" ? "bg-primary/20 text-primary" : ""}`}
      >
        <Link href="/history">
          <History className="h-5 w-5" />
          <span className="sr-only">History</span>
        </Link>
      </Button>
    </div>
  )
}

