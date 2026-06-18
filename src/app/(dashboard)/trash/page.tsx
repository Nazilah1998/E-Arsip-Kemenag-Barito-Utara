"use client"

import { PageBanner } from "@/components/ui/PageBanner"
import { Trash2, RefreshCw, AlertTriangle } from "lucide-react"

export default function TrashPage() {
  const mockTrash = [
    { id: 1, name: "Draft_Laporan_Lama.docx", type: "file", deletedAt: "15 Jun 2026", expiresAt: "15 Jul 2026" },
    { id: 2, name: "Foto_Kegiatan_2024", type: "folder", deletedAt: "10 Jun 2026", expiresAt: "10 Jul 2026" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageBanner
        title="Recycle Bin (Trash)"
        description="Dokumen yang dihapus akan tersimpan di sini selama 30 hari sebelum dihapus permanen"
        icon={<Trash2 className="h-6 w-6 text-white" />}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Item di bawah ini dapat dikembalikan ke lokasi asal.
          </div>
          <button className="text-sm font-medium text-destructive hover:underline">
            Kosongkan Trash
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Item</th>
                <th className="px-6 py-3 font-medium">Tanggal Dihapus</th>
                <th className="px-6 py-3 font-medium">Hapus Permanen Pada</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockTrash.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.deletedAt}</td>
                  <td className="px-6 py-4 text-orange-600">{item.expiresAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                      <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Permanen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mockTrash.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Trash2 className="mb-4 h-12 w-12 opacity-20" />
              <p>Recycle Bin kosong</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
