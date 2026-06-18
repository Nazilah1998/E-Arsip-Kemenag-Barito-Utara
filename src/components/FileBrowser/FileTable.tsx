"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  CellContext,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { FileIcon, Folder as FolderIcon, FileText, Image as ImageIcon, Download, MoreVertical, Eye } from "lucide-react"
import { useRef } from "react"

interface FileItem {
  id: string
  name: string
  type: "folder" | "file"
  mimeType?: string
  size?: string
  updatedAt: string
  isRestricted: boolean
}

interface FileTableProps {
  data: FileItem[]
  onNavigate?: (id: string) => void
}

const getIcon = (item: FileItem) => {
  if (item.type === "folder") return <FolderIcon className="h-5 w-5 fill-blue-500 text-blue-500" />
  if (item.mimeType?.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
  if (item.mimeType?.includes("image")) return <ImageIcon className="h-5 w-5 text-green-500" />
  return <FileIcon className="h-5 w-5 text-gray-500" />
}

export function FileTable({ data, onNavigate }: FileTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const columns = [
    {
      header: "Nama",
      accessorKey: "name",
      cell: (info: CellContext<FileItem, unknown>) => {
        const item = info.row.original
        return (
          <div 
            className={`flex items-center gap-3 ${item.type === "folder" ? "cursor-pointer hover:underline" : ""}`}
            onClick={() => {
              if (item.type === "folder" && onNavigate) {
                onNavigate(item.id)
              }
            }}
          >
            {getIcon(item)}
            <span className="font-medium truncate max-w-[200px] md:max-w-md">
              {info.getValue() as string}
            </span>
            {item.isRestricted && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                View Only
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: "Diperbarui",
      accessorKey: "updatedAt",
      cell: (info: CellContext<FileItem, unknown>) => <span className="text-muted-foreground">{info.getValue() as string}</span>,
    },
    {
      header: "Ukuran",
      accessorKey: "size",
      cell: (info: CellContext<FileItem, unknown>) => <span className="text-muted-foreground">{(info.getValue() as string) || "-"}</span>,
    },
    {
      header: "",
      id: "actions",
      cell: (info: CellContext<FileItem, unknown>) => {
        const item = info.row.original
        return (
          <div className="flex justify-end gap-2">
            {!item.isRestricted && item.type !== "folder" && (
              <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Download className="h-4 w-4" />
              </button>
            )}
            {(item.mimeType?.includes("pdf") || item.mimeType?.includes("image")) && (
              <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53,
    overscan: 10,
  })

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div ref={tableContainerRef} className="max-h-[600px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted/50 text-muted-foreground z-10 backdrop-blur-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 font-medium border-b">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody 
              className="divide-y relative"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index]
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 absolute w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <FolderIcon className="mb-4 h-12 w-12 opacity-20" />
              <p>Folder ini kosong</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
