"use client"

import { PageBanner } from "@/components/ui/PageBanner"
import { Building2, Plus, Pencil, Trash2 } from "lucide-react"

export default function BidangManagementPage() {
  const mockBidang = [
    { id: 1, name: "Sub Bagian Tata Usaha", count: 450 },
    { id: 2, name: "Seksi Pendidikan Madrasah", count: 320 },
    { id: 3, name: "Seksi Bimbingan Masyarakat Islam", count: 180 },
    { id: 4, name: "Seksi Penyelenggara Haji dan Umrah", count: 298 },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageBanner
        title="Manajemen Bidang / Seksi"
        description="Kelola daftar seksi dan bidang yang terdaftar dalam sistem E-Arsip"
        icon={<Building2 className="h-6 w-6 text-white" />}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Daftar Bidang</h3>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tambah Bidang
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Bidang</th>
                <th className="px-6 py-3 font-medium">Total Dokumen</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockBidang.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{b.count} dokumen</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md p-2 text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
