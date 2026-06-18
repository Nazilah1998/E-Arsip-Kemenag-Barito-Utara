"use client"

import { RefreshCw, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TrashItem {
  id: string
  name: string
  type: "folder" | "file"
  deletedAt: string
  expiresAt: string
}

interface TrashViewProps {
  initialData: TrashItem[]
}

export function TrashView({ initialData }: TrashViewProps) {
  const [items, setItems] = useState(initialData)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"restore" | "delete" | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleRestore = async (item: TrashItem) => {
    setLoadingId(item.id)
    setActionType("restore")
    try {
      const table = item.type === "folder" ? "folders" : "files"
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq("id", item.id)

      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== item.id))
      router.refresh()
    } catch (error) {
      console.error("Restore failed:", error)
      alert("Gagal merestore item.")
    } finally {
      setLoadingId(null)
      setActionType(null)
    }
  }

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(`Hapus permanen "${item.name}"? File tidak bisa dikembalikan.`)) return
    
    setLoadingId(item.id)
    setActionType("delete")
    try {
      const table = item.type === "folder" ? "folders" : "files"
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", item.id)

      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== item.id))
      router.refresh()
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Gagal menghapus item.")
    } finally {
      setLoadingId(null)
      setActionType(null)
    }
  }

  const handleEmptyTrash = async () => {
    if (items.length === 0) return
    if (!confirm("Kosongkan seluruh Recycle Bin? Tindakan ini permanen.")) return
    
    // Simplification for UI: We ideally need a server action to loop through and delete all.
    // For now, let's just alert the user that it's disabled in this demo if it's too complex, or we can write a simple client-side loop.
    alert("Proses pengosongan massal sedang berjalan di latar belakang...")
    let successCount = 0
    for (const item of items) {
      const table = item.type === "folder" ? "folders" : "files"
      const { error } = await supabase.from(table).delete().eq("id", item.id)
      if (!error) successCount++
    }
    
    if (successCount === items.length) {
      setItems([])
      router.refresh()
    } else {
      alert("Sebagian item gagal dihapus. Silakan muat ulang halaman.")
      router.refresh()
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-orange-50 px-4 py-2 rounded-xl ring-1 ring-orange-100/50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Item di bawah ini dapat dikembalikan ke lokasi asal.
        </div>
        <button 
          onClick={handleEmptyTrash}
          disabled={items.length === 0}
          className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-transparent"
        >
          Kosongkan Trash
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50/90 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="border-b border-slate-100 px-8 py-4">Nama Item</th>
              <th className="border-b border-slate-100 px-8 py-4">Tanggal Dihapus</th>
              <th className="border-b border-slate-100 px-8 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="group transition-colors hover:bg-slate-50/80">
                <td className="px-8 py-4 font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    {item.type === "folder" ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">F</span>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold text-xs">D</span>
                    )}
                    {item.name}
                  </div>
                </td>
                <td className="px-8 py-4 text-sm font-medium text-slate-500">{item.deletedAt}</td>
                <td className="px-8 py-4">
                  <div className="flex justify-end gap-2 transition-opacity">
                    <button 
                      onClick={() => handleRestore(item)}
                      disabled={loadingId === item.id}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50"
                    >
                      {loadingId === item.id && actionType === "restore" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Restore
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(item)}
                      disabled={loadingId === item.id}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
                    >
                      {loadingId === item.id && actionType === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Hapus Permanen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
              <Trash2 className="h-10 w-10" />
            </div>
            <p className="mt-4 font-bold text-slate-700">Recycle Bin kosong</p>
          </div>
        )}
      </div>
    </div>
  )
}
