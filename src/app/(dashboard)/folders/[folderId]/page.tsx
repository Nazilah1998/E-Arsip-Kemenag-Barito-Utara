"use client"

import { useRouter } from "next/navigation"
import { PageBanner } from "@/components/ui/PageBanner"
import { Breadcrumbs } from "@/components/FileBrowser/Breadcrumbs"
import { FileTable } from "@/components/FileBrowser/FileTable"
import { FolderOpen, Upload, FolderPlus, Search } from "lucide-react"

// Mock Data
const mockBreadcrumbs = [
  { id: "root", name: "Seksi Pendidikan Madrasah" },
  { id: "2026", name: "Tahun 2026" },
  { id: "sk", name: "SK Guru" },
]

const mockFiles = [
  { id: "f1", name: "SK_Pengangkatan_2026.pdf", type: "file" as const, mimeType: "application/pdf", size: "2.4 MB", updatedAt: "18 Jun 2026", isRestricted: false },
  { id: "f2", name: "Rekap_Data_Guru.xlsx", type: "file" as const, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: "1.1 MB", updatedAt: "17 Jun 2026", isRestricted: true },
  { id: "d1", name: "Lampiran Foto", type: "folder" as const, updatedAt: "16 Jun 2026", isRestricted: false },
]

export default function FolderPage() {
  const router = useRouter()
  
  // In a real app, fetch data based on params.folderId
  
  return (
    <div className="flex flex-col gap-6">
      <PageBanner
        title="File Browser"
        description="Jelajahi dan kelola dokumen pada seksi/bidang Anda"
        icon={<FolderOpen className="h-6 w-6 text-white" />}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumbs items={mockBreadcrumbs} />
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Cari file..."
              className="h-9 w-full sm:w-[200px] rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button className="flex h-9 items-center justify-center rounded-md border bg-card px-3 text-sm font-medium shadow-sm hover:bg-muted">
            <FolderPlus className="mr-2 h-4 w-4" />
            Folder Baru
          </button>
          <button className="flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      <FileTable 
        data={mockFiles} 
        onNavigate={(id) => router.push(`/folders/${id}`)}
      />
    </div>
  )
}
