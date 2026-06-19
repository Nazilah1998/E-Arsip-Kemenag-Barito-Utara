"use client"

import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function FolderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Terjadi Kesalahan</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Gagal memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-slate-400 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
        <Link
          href="/folders/root"
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition-all hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}
