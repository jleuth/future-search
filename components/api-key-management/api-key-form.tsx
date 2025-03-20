"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Key, Loader2, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-context"
import { useApiKey } from "@/lib/hooks/use-api-key"

export function ApiKeyForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { apiKeyExists, saveApiKey, deleteApiKey, isLoading: keyLoading } = useApiKey()

  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      // Send API key directly to server over HTTPS
      await saveApiKey(apiKey)

      setSuccessMessage("API key saved successfully!")
      setApiKey("")
    } catch (err: any) {
      setError(err.message || "Failed to save API key")
      console.error("Error saving API key:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      await deleteApiKey()
      setSuccessMessage("API key deleted successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to delete API key")
      console.error("Error deleting API key:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Please log in to manage your API keys</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Perplexity API Key</CardTitle>
        <CardDescription>
          {apiKeyExists
            ? "Your API key is securely stored. You can update or delete it below."
            : "Enter your Perplexity API key to enable search functionality"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="bg-primary/10 border-primary/30 text-primary">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">{apiKeyExists ? "Update API Key" : "API Key"}</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="pk-xxxxxxxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background/50 pr-10 pl-10"
                required={!apiKeyExists}
              />
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">{showApiKey ? "Hide API key" : "Show API key"}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is transmitted securely via HTTPS and encrypted before being stored in our database.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/40 pt-4">
        {apiKeyExists && (
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading || keyLoading}
            className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Key
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || keyLoading || !apiKey}
          className={apiKeyExists ? "ml-auto" : ""}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {apiKeyExists ? "Update Key" : "Save Key"}
        </Button>
      </CardFooter>
    </Card>
  )
}

