"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"

export function useApiKey() {
  const { user } = useAuth()
  const [apiKeyExists, setApiKeyExists] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if API key exists
  useEffect(() => {
    async function checkApiKey() {
      if (!user) {
        setApiKeyExists(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch("/api/keys")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }))
          throw new Error(errorData.error || `Failed to check API key status: ${response.statusText}`)
        }

        const data = await response.json().catch(() => {
          throw new Error("Invalid response format")
        })

        setApiKeyExists(data.exists)
      } catch (err: any) {
        console.error("Error checking API key:", err)
        setError(err.message || "Failed to check API key")
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [user])

  // Save API key
  const saveApiKey = async (apiKey: string) => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }))
        throw new Error(errorData.error || `Failed to save API key: ${response.statusText}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Invalid response format")
      })

      setApiKeyExists(true)
      return data
    } catch (err: any) {
      console.error("Error saving API key:", err)
      throw new Error(err.message || "Failed to save API key")
    }
  }

  // Delete API key
  const deleteApiKey = async () => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    try {
      const response = await fetch("/api/keys", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }))
        throw new Error(errorData.error || `Failed to delete API key: ${response.statusText}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Invalid response format")
      })

      setApiKeyExists(false)
      return data
    } catch (err: any) {
      console.error("Error deleting API key:", err)
      throw new Error(err.message || "Failed to delete API key")
    }
  }

  return {
    apiKeyExists,
    saveApiKey,
    deleteApiKey,
    isLoading,
    error,
  }
}

