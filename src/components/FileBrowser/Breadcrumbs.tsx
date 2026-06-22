"use client"

import Link from "next/link"
import { ChevronRight, Home, Loader2 } from "lucide-react"
import { useState, Fragment } from "react"
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
    <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground w-full overflow-x-auto whitespace-nowrap min-w-0" aria-label="Breadcrumb" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style dangerouslySetInnerHTML={{__html: `nav::-webkit-scrollbar { display: none; }`}} />
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const isFirst = index === 0
        const isNearEnd = index >= allItems.length - 2
        
        // Hide middle items if total length > 4 (desktop and mobile)
        const shouldHide = allItems.length > 4 && !isFirst && !isNearEnd
        const isDragOver = dragOverId === item.id

        return (
          <Fragment key={item.id}>
            {index === 1 && allItems.length > 4 && (
              <div className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-400" />
                <span className="px-1 text-slate-400 font-bold tracking-widest">...</span>
              </div>
            )}
            <div className={`items-center gap-1 sm:gap-1.5 ${shouldHide ? 'hidden' : 'flex'}`}>
              {index > 0 && <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-slate-400" />}
              <div
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`flex items-center rounded-lg transition-all px-0.5 ${
                  isDragOver ? "bg-blue-100 ring-2 ring-blue-500 scale-105" : ""
                }`}
              >
                <Link
                  href={`/folders/${item.id}`}
                  className={`flex items-center max-w-[140px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] transition-all px-2.5 py-1.5 rounded-lg ${
                    isLast ? "font-bold text-slate-800 pointer-events-none bg-slate-100/60" : "font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.id === "root" && index === 0 ? (
                    <>
                      <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">Home</span>
                    </>
                  ) : (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
                {isMoving && isDragOver && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600 flex-shrink-0" />}
              </div>
            </div>
          </Fragment>
        )
      })}
    </nav>
  )
}

