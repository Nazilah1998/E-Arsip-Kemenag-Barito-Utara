"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  CellContext,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from "@tanstack/react-table"
import { FileIcon, Folder as FolderIcon, FileText, Image as ImageIcon, Download, Eye, Trash2, ChevronLeft, ChevronRight, Loader2, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { FilePreviewModal } from "./FilePreviewModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { RenameItemModal } from "./RenameItemModal"
import { deleteItem, renameItem, moveItem } from "@/app/(dashboard)/folders/actions"

interface FileItem {
  id: string
  name: string
  type: "folder" | "file"
  mimeType?: string
  size?: string
  updatedAt: string
  isRestricted: boolean
  objectKey?: string
}

interface FileTableProps {
  data: FileItem[]
  onNavigate?: (id: string) => void
  folderId?: string
}

const getIcon = (item: FileItem) => {
  if (item.type === "folder") return <FolderIcon className="h-5 w-5 fill-blue-500 text-blue-500" />
  if (item.mimeType?.includes("pdf")) return <FileText className="h-5 w-5 text-rose-500" />
  if (item.mimeType?.includes("image")) return <ImageIcon className="h-5 w-5 text-emerald-500" />
  return <FileIcon className="h-5 w-5 text-slate-500" />
}

export function FileTable({ data, onNavigate, folderId }: FileTableProps) {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [itemToRename, setItemToRename] = useState<FileItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const [draggedItem, setDraggedItem] = useState<FileItem | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [optimisticHiddenIds, setOptimisticHiddenIds] = useState<string[]>([])
  
  const supabase = createClient()
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_ARSIP_BUCKET || "Files-arsip"

  const getSignedUrl = async (objectKey: string, download: string | boolean = false) => {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(objectKey, 60, { download })
    
    if (error) throw new Error(error.message)
    return data.signedUrl
  }

  const handleDownload = async (item: FileItem) => {
    if (!item.objectKey) return
    setDownloadingId(item.id)
    try {
      const url = await getSignedUrl(item.objectKey, item.name)
      const a = document.createElement('a')
      a.href = url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Gagal mengunduh file. Akses ditolak atau file tidak ditemukan.")
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = async (item: FileItem) => {
    if (!item.objectKey) return
    
    const isSupported = item.mimeType === "application/pdf" || item.mimeType?.startsWith("image/")
    if (!isSupported) {
      return handleDownload(item)
    }

    setPreviewFile(item)
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewUrl(null)

    try {
      // For images, we can download it directly into the img tag using a signed url without the download disposition
      const url = await getSignedUrl(item.objectKey, false)
      setPreviewUrl(url)
    } catch (error) {
      console.error("Preview failed:", error)
      setPreviewError("Gagal membuka dokumen. Akses ditolak atau sesi habis.")
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDeleteClick = (item: FileItem) => {
    setItemToDelete(item)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const result = await deleteItem(itemToDelete.id, itemToDelete.type, folderId || null)
      if (!result.success) {
        throw new Error(result.error)
      }
      setItemToDelete(null)
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Gagal menghapus item.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRenameConfirm = async (newName: string) => {
    if (!itemToRename) return
    const result = await renameItem(itemToRename.id, itemToRename.type, newName, folderId || null)
    if (!result.success) throw new Error(result.error)
  }

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    if (item.isRestricted) {
      e.preventDefault()
      return
    }
    setDraggedItem(item)
    e.dataTransfer.setData("text/plain", item.id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, item: FileItem) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (item.type === "folder" && item.id !== draggedItem?.id && !isMoving) {
      setDragOverFolderId(item.id)
    }
  }

  const handleDragLeave = (e: React.DragEvent, item: FileItem) => {
    e.preventDefault()
    if (dragOverFolderId === item.id) {
      setDragOverFolderId(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetItem: FileItem) => {
    e.preventDefault()
    setDragOverFolderId(null)
    
    if (!draggedItem || targetItem.type !== "folder" || draggedItem.id === targetItem.id) return
    
    setIsMoving(true)
    
    // Optimistically hide the moved item so it feels instant
    const movedItemId = draggedItem.id
    setOptimisticHiddenIds((prev) => [...prev, movedItemId])
    
    try {
      const result = await moveItem(movedItemId, draggedItem.type, targetItem.id, folderId || null)
      if (!result.success) {
        // Revert optimistic update on failure
        setOptimisticHiddenIds((prev) => prev.filter(id => id !== movedItemId))
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Move failed:", error)
      alert("Gagal memindahkan file/folder.")
    } finally {
      setIsMoving(false)
      setDraggedItem(null)
    }
  }

  const columns = [
    {
      header: "Nama File/Folder",
      accessorKey: "name",
      meta: { className: "flex-1 min-w-0" }, // min-w-0 ensures truncation works
      cell: (info: CellContext<FileItem, unknown>) => {
        const item = info.row.original
        return (
          <div 
            className={`group/item flex items-center gap-3 py-1 ${item.type === "folder" ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (item.type === "folder" && onNavigate) {
                onNavigate(item.id)
              }
            }}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform ${item.type === "folder" ? "bg-blue-50 text-blue-600 group-hover/item:scale-110 group-hover/item:bg-blue-100" : "bg-slate-50 text-slate-500"}`}>
              {getIcon(item)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-bold truncate max-w-full ${item.type === "folder" ? "text-slate-800 group-hover/item:text-blue-700" : "text-slate-700"}`}>
                {info.getValue() as string}
              </span>
              {/* Show sizes on mobile directly below the name since columns are hidden */}
              <span className="md:hidden text-xs text-slate-400 mt-0.5 truncate">
                {item.type === "file" ? `${item.size || "-"} • ${item.updatedAt}` : item.updatedAt}
              </span>
            </div>
            {item.isRestricted && (
              <span className="shrink-0 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 ring-1 ring-inset ring-rose-200">
                LOCKED
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: "Diperbarui",
      accessorKey: "updatedAt",
      meta: { className: "w-40 lg:w-48 flex-shrink-0 hidden md:flex items-center" },
      cell: (info: CellContext<FileItem, unknown>) => <span className="text-sm font-medium text-slate-500">{info.getValue() as string}</span>,
    },
    {
      header: "Ukuran",
      accessorKey: "size",
      meta: { className: "w-32 lg:w-40 flex-shrink-0 hidden md:flex items-center" },
      cell: (info: CellContext<FileItem, unknown>) => <span className="text-sm font-medium text-slate-500">{(info.getValue() as string) || "-"}</span>,
    },
    {
      header: "Aksi",
      id: "actions",
      meta: { className: "w-auto md:w-40 lg:w-48 flex-shrink-0 flex items-center justify-end" },
      cell: (info: CellContext<FileItem, unknown>) => {
        const item = info.row.original
        return (
          <div className="flex items-center justify-end gap-1.5 md:gap-2">
            {!item.isRestricted && item.type !== "folder" && (
              <button 
                title="Download Dokumen"
                onClick={() => handleDownload(item)}
                disabled={downloadingId === item.id}
                className="rounded-lg p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {downloadingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            )}
            {(item.mimeType?.includes("pdf") || item.mimeType?.includes("image") || item.mimeType?.includes("word") || item.mimeType?.includes("excel")) && (
              <button 
                title="Lihat Pratinjau"
                onClick={() => handlePreview(item)}
                className="rounded-lg p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {!item.isRestricted && (
              <button 
                title="Ubah Nama"
                onClick={(e) => {
                  e.stopPropagation()
                  setItemToRename(item)
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button 
              title="Hapus"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(item)
              }}
              className="rounded-lg p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ]

  // Filter out optimistically hidden items
  const visibleData = data.filter((item) => !optimisticHiddenIds.includes(item.id))

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: visibleData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const { rows } = table.getRowModel()

  return (
    <div className="flex flex-col rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
      {/* Table Area */}
      <div className="w-full text-left text-sm flex flex-col">
        
        {/* Table Header */}
        <div className="hidden md:flex w-full bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex w-full">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const isSorted = header.column.getIsSorted()
                return (
                  <div 
                    key={header.id} 
                    className={`px-4 lg:px-6 py-4 text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1 ${(header.column.columnDef.meta as Record<string, string>)?.className || ""} ${canSort ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {canSort && (
                      <span className="text-slate-400">
                        {{
                          asc: <ArrowUp className="h-3 w-3" />,
                          desc: <ArrowDown className="h-3 w-3" />,
                        }[isSorted as string] ?? <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="w-full flex flex-col divide-y divide-slate-50">
          {rows.map((row) => {
            const item = row.original as FileItem
            const isDragOver = dragOverFolderId === item.id
            return (
              <div
                key={row.id}
                draggable={!item.isRestricted}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, item)}
                onDragLeave={(e) => handleDragLeave(e, item)}
                onDrop={(e) => handleDrop(e, item)}
                className={`flex w-full items-center transition-all py-1 border-2 border-transparent ${
                  isDragOver ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-100 rounded-lg scale-[1.01] shadow-md z-10" : "hover:bg-slate-50/50"
                } ${draggedItem?.id === item.id ? "opacity-50" : ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className={`px-4 lg:px-6 py-2 ${(cell.column.columnDef.meta as Record<string, string>)?.className || ""}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          })}

          {/* Empty State */}
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 mb-4">
                <FolderIcon className="h-10 w-10" />
              </div>
              <p className="font-bold text-slate-700">Folder ini kosong</p>
              <p className="mt-1 text-sm font-medium text-slate-500 max-w-[250px]">Silakan unggah dokumen baru atau buat sub-folder di sini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {data.length > 10 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 px-6">
          <span className="text-xs font-semibold text-slate-500">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <FilePreviewModal 
        isOpen={!!previewFile}
        onClose={() => {
          setPreviewFile(null)
          setPreviewUrl(null)
        }}
        fileUrl={previewUrl}
        fileName={previewFile?.name || ""}
        mimeType={previewFile?.mimeType || ""}
        isLoading={previewLoading}
        error={previewError}
      />

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType={itemToDelete?.type || "file"}
        isDeleting={isDeleting}
      />

      <RenameItemModal
        isOpen={!!itemToRename}
        onClose={() => setItemToRename(null)}
        onConfirm={handleRenameConfirm}
        initialName={itemToRename?.name || ""}
        itemType={itemToRename?.type || "file"}
      />
    </div>
  )
}
