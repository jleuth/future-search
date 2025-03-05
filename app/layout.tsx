import type React from "react"
import type { Metadata } from "next"
import ClientComponent from "./client"

export const metadata: Metadata = {
  title: "Seekup - AI-Powered Answer Engine",
  description: "Get instant, accurate answers with proper source citations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientComponent>{children}</ClientComponent>
}

