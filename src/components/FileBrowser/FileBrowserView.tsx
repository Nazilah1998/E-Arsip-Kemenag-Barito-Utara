"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/FileBrowser/Breadcrumbs"
import { FileTable } from "@/components/FileBrowser/FileTable"
import { FolderPlus, Upload, Search } from "lucide-react"
import { CreateFolderModal } from "./CreateFolderModal"
import { UploadFileModal } from "./UploadFileModal"

interface FileBrowserViewProps {
  folderId: string
  initialItems: {
    id: string
    name: string
    type: "folder" | "file"
    mimeType?: string
    size?: string
    updatedAt: string
    isRestricted: boolean
  }[]
  breadcrumbs: { id: string; name: string }[]
  userBidangId: string
}

export function FileBrowserView({ folderId, initialItems, breadcrumbs, userBidangId }: FileBrowserViewProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <Breadcrumbs items={breadcrumbs} currentFolderId={folderId} />
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Cari file..."
              className="h-10 w-full sm:w-[240px] rounded-xl border-0 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex h-10 items-center justify-center rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Folder Baru
          </button>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </button>
        </div>
      </div>

      <FileTable 
        data={initialItems} 
        onNavigate={(id) => router.push(`/folders/${id}`)}
        folderId={folderId}
      />

      <CreateFolderModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        parentId={folderId} 
      />
      
      <UploadFileModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        folderId={folderId}
        userBidangId={userBidangId}
      />
    </>
  )
}
