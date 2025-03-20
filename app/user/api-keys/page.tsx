"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ApiKeyForm } from "@/components/api-key-management/api-key-form"
import { HeaderNav } from "@/components/header-nav"
import { useAuth } from "@/components/auth/auth-context"

export default function ApiKeysPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsPageLoading(false)
      }
    }
  }, [authLoading, user, router])

  if (authLoading || isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
            <HeaderNav currentPage="search" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold mb-6 gradient-text">API Key Management</h1>
            <p className="text-muted-foreground mb-6">
              Manage your Perplexity API key securely. Your key is encrypted end-to-end and only decrypted when needed
              for API calls.
            </p>

            <ApiKeyForm />
          </div>
        </div>
      </main>
    </div>
  )
}

