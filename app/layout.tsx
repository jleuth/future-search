import type React from "react"
import type { Metadata } from "next"
import ClientComponent from "./client"
import { AuthProvider } from "@/components/auth/auth-context"

export const metadata: Metadata = {
  title: "Seekup - AI-Powered Answer Engine",
  description: "Get instant, accurate answers with proper source citations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if Supabase environment variables are set
  const isMissingEnvVars = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isMissingEnvVars) {
    return (
      <html lang="en">
        <body>
          <div style={{ padding: "20px", color: "red" }}>
            <h1>Configuration Error</h1>
            <p>
              Supabase environment variables are not set correctly. Please check your .env.local file or Vercel
              environment variables.
            </p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <AuthProvider>
      <ClientComponent>{children}</ClientComponent>
    </AuthProvider>
  )
}

