"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Force dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <div className="bg-gradient-to-br from-background via-background to-background/90 min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

