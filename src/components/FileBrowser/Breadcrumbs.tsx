"use client"

import Link from "next/link"
import { ChevronRight, Home, Loader2 } from "lucide-react"
import { useState } from "react"
import { moveItem } from "@/app/(dashboard)/folders/actions"
import { toast } from "sonner"

interface BreadcrumbItem {
  id: string
  name: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  currentFolderId: string
}

export function Breadcrumbs({ items, currentFolderId }: BreadcrumbsProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    // Don't allow dropping into the current folder itself
    if (targetId !== currentFolderId && !isMoving) {
      setDragOverId(targetId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    
    if (targetId === currentFolderId) return

    try {
      const dataStr = e.dataTransfer.getData("application/json")
      if (!dataStr) return
      
      const data = JSON.parse(dataStr)
      if (!data.id || !data.type) return

      setIsMoving(true)
      const result = await moveItem(data.id, data.type, targetId, currentFolderId)
      if (!result.success) throw new Error(result.error)
      
      toast.success("Item berhasil dipindahkan.")
    } catch (error) {
      console.error("Move to breadcrumb failed:", error)
      toast.error("Gagal memindahkan item.")
    } finally {
      setIsMoving(false)
    }
  }

  // Prepend Root if it's not there, just for the UI
  const allItems = items.length === 0 || items[0].id !== "root" 
    ? [{ id: "root", name: "Root" }, ...items] 
    : items

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const isDragOver = dragOverId === item.id

        return (
          <div key={item.id} className="flex items-center space-x-1">
            {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            <div
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`flex items-center rounded-lg transition-all px-2 py-1 ${
                isDragOver ? "bg-blue-100 ring-2 ring-blue-500 scale-105" : ""
              }`}
            >
              <Link
                href={`/folders/${item.id}`}
                className={`flex items-center truncate max-w-[150px] transition-colors hover:text-slate-900 ${
                  isLast ? "font-bold text-slate-800 pointer-events-none" : "font-medium text-slate-500"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.id === "root" && index === 0 ? (
                  <>
                    <Home className="h-4 w-4 mr-1.5" />
                    <span>Home</span>
                  </>
                ) : (
                  item.name
                )}
              </Link>
              {isMoving && isDragOver && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

