"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThinkDropdownProps {
  children: React.ReactNode
}

export function ThinkDropdown({ children }: ThinkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-4 border border-primary/20 rounded-md overflow-hidden">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center p-2 bg-primary/10 hover:bg-primary/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">Reasoning Steps</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>
      {isOpen && <div className="p-4 bg-secondary/20">{children}</div>}
    </div>
  )
}

