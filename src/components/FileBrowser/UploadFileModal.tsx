"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, FileUp, AlertCircle, CheckCircle2, Loader2, Trash2, FolderUp } from "lucide-react"
import { saveFileMetadata } from "@/app/(dashboard)/folders/actions"
import { createClient } from "@/lib/supabase/client"
import { formatFileSize } from "@/lib/utils"
import { toast } from "sonner"

interface UploadFileModalProps {
  isOpen: boolean
  onClose: () => void
  folderId: string
  userBidangId: string
  initialFiles?: File[]
  isFolderMode?: boolean
}

type FileStatus = 'pending' | 'uploading' | 'success' | 'error'

interface UploadItem {
  id: string
  file: File
  progress: number
  status: FileStatus
  error?: string
}

export function UploadFileModal({ isOpen, onClose, folderId, userBidangId, initialFiles, isFolderMode = false }: UploadFileModalProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [globalError, setGlobalError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_ARSIP_BUCKET || "Files-arsip"

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setUploadItems([])
        setIsUploading(false)
        setGlobalError("")
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Helper to add files to state
  const addFiles = (newFiles: File[]) => {
    if (uploadItems.length + newFiles.length > 50) {
      setGlobalError("Maksimal 50 file dapat diunggah sekaligus.")
      newFiles = newFiles.slice(0, 50 - uploadItems.length)
    } else {
      setGlobalError("")
    }

    const items: UploadItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadItems(prev => [...prev, ...items])
  }

  useEffect(() => {
    if (isOpen && initialFiles && initialFiles.length > 0 && uploadItems.length === 0) {
      const timer = setTimeout(() => addFiles(initialFiles), 0)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFiles])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Recursive folder parsing
  interface WebkitEntry {
    isFile: boolean
    isDirectory: boolean
    file: (cb: (file: File) => void) => void
    createReader: () => { readEntries: (cb: (entries: WebkitEntry[]) => void) => void }
  }

  const getFilesFromDataTransfer = async (items: DataTransferItemList): Promise<File[]> => {
    const files: File[] = []
    const entries: WebkitEntry[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry() as unknown as WebkitEntry
        if (entry) entries.push(entry)
      }
    }

    const readEntry = async (entry: WebkitEntry) => {
      if (entry.isFile) {
        return new Promise<void>((resolve) => {
          entry.file((file: File) => {
            files.push(file)
            resolve()
          })
        })
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (dirEntries: WebkitEntry[]) => {
            for (const childEntry of dirEntries) {
              await readEntry(childEntry)
            }
            resolve()
          })
        })
      }
    }

    for (const entry of entries) {
      await readEntry(entry)
    }

    
    return files
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setGlobalError("Memindai folder... Mohon tunggu.")
      const extractedFiles = await getFilesFromDataTransfer(e.dataTransfer.items)
      setGlobalError("")
      if (extractedFiles.length > 0) {
        addFiles(extractedFiles)
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const removeFile = (id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItemStatus = (id: string, updates: Partial<UploadItem>) => {
    setUploadItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const handleUpload = async () => {
    const pendingItems = uploadItems.filter(i => i.status === 'pending' || i.status === 'error')
    if (pendingItems.length === 0) return

    setIsUploading(true)
    setGlobalError("")
    let successCount = 0

    // Upload sequentially to avoid overloading DB/Storage
    for (const item of pendingItems) {
      updateItemStatus(item.id, { status: 'uploading', progress: 10, error: undefined })

      try {
        const fileExt = item.file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const folderPathSegment = folderId === 'root' ? 'root' : folderId
        const filePath = `${userBidangId}/${folderPathSegment}/${fileName}`

        updateItemStatus(item.id, { progress: 30 })
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, item.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw new Error(uploadError.message)
        
        updateItemStatus(item.id, { progress: 70 })

        const result = await saveFileMetadata({
          name: item.file.name,
          folderId: folderId,
          r2ObjectKey: uploadData.path,
          mimeType: item.file.type || "application/octet-stream",
          sizeBytes: item.file.size
        })

        if (!result.success) throw new Error(result.error || "Database error")

        successCount++
        updateItemStatus(item.id, { status: 'success', progress: 100 })
      } catch (err) {
        updateItemStatus(item.id, { 
          status: 'error', 
          error: err instanceof Error ? err.message : String(err),
          progress: 0 
        })
      }
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount} file berhasil diunggah.`)
    }
  }

  const allSuccess = uploadItems.length > 0 && uploadItems.every(i => i.status === 'success')
  const hasFiles = uploadItems.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl animate-in zoom-in-95 rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Dokumen (Batch)</h2>
              <p className="text-xs text-slate-500">Maksimal 50 file sekaligus</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-8 text-center
              ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[0.98]' : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition-transform ${isDragging ? 'scale-110' : ''}`}>
              <FileUp className={`h-6 w-6 ${isDragging ? 'text-emerald-600' : 'text-emerald-500'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Klik atau seret file / folder ke sini</p>
            <p className="mt-1 text-xs text-slate-500">Dukung drag-and-drop 1 folder penuh sekaligus</p>
            {isFolderMode ? (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                // @ts-expect-error - React doesn't fully support these attributes yet
                webkitdirectory=""
                directory=""
              />
            ) : (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            )}
            
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {isFolderMode ? <FolderUp className="h-8 w-8" /> : <FileUp className="h-8 w-8" />}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {isFolderMode ? 'Pilih Folder untuk Diunggah' : 'Pilih File atau Tarik ke Sini'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {isFolderMode ? 'Seluruh file dalam folder akan diunggah (Maksimal 50 file sekaligus)' : 'Maksimal 50 file sekaligus. Tarik dan lepas untuk menambahkan.'}
            </p>
          </div>

          {globalError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="font-medium">{globalError}</p>
            </div>
          )}

          {/* File List */}
          {hasFiles && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Daftar Antrean ({uploadItems.length})</span>
                {allSuccess && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Selesai</span>}
              </div>
              
              <div className="space-y-2">
                {uploadItems.map(item => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex items-center gap-4">
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50">
                      {item.status === 'pending' && <FileUp className="h-4 w-4 text-slate-400" />}
                      {item.status === 'uploading' && <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />}
                      {item.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {item.status === 'error' && <AlertCircle className="h-4 w-4 text-rose-500" />}
                    </div>

                    {/* File Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="truncate text-sm font-bold text-slate-700 pr-2">{item.file.name}</p>
                        <p className="text-xs font-medium text-slate-400 whitespace-nowrap">{formatFileSize(item.file.size)}</p>
                      </div>
                      
                      {/* Progress bar or Error */}
                      {item.status === 'error' ? (
                        <p className="text-xs font-medium text-rose-500 truncate" title={item.error}>{item.error}</p>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div 
                              className={`h-full transition-all duration-300 ease-out ${item.status === 'success' ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{item.progress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {item.status !== 'uploading' && item.status !== 'success' && (
                      <button 
                        onClick={() => removeFile(item.id)}
                        disabled={isUploading}
                        className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 p-6 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {allSuccess ? "Tutup" : "Batal"}
          </button>
          
          {!allSuccess && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !hasFiles}
              className="flex items-center gap-2 justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Mulai Upload
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
