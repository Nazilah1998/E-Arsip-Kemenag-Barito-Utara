"use client"

import { X, Download, AlertCircle, Loader2 } from "lucide-react"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string | null
  fileName: string
  mimeType: string
  isLoading: boolean
  error: string | null
}

export function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  mimeType,
  isLoading,
  error
}: FilePreviewModalProps) {
  if (!isOpen) return null

  const isImage = mimeType.startsWith("image/")
  const isPdf = mimeType === "application/pdf"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-8">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col animate-in zoom-in-95 rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="truncate text-lg font-bold text-slate-800">{fileName}</h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{mimeType}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a 
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
          
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-bold text-slate-600 animate-pulse">Memuat dokumen aman...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center max-w-md text-center p-8 rounded-2xl bg-white shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Gagal Membuka File</h3>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && fileUrl && (
            <div className="h-full w-full rounded-xl overflow-hidden shadow-inner ring-1 ring-black/5 bg-white flex items-center justify-center">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={fileUrl} 
                  alt={fileName} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : isPdf ? (
                <iframe 
                  src={`${fileUrl}#toolbar=0`} 
                  className="h-full w-full border-0"
                  title={fileName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-4">
                    <Download className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Pratinjau Tidak Tersedia</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs">
                    Browser Anda tidak mendukung pratinjau langsung untuk tipe file ini. Silakan unduh file untuk melihat isinya.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
