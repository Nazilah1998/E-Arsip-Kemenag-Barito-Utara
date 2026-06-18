"use client"

import { PageBanner } from "@/components/ui/PageBanner"
import { Users, Plus, Pencil, Shield, Trash2 } from "lucide-react"

export default function UsersManagementPage() {
  const mockUsers = [
    { id: 1, name: "Ahmad Dahlan", username: "ahmad.d", role: "Super Admin", bidang: "-" },
    { id: 2, name: "Budi Santoso", username: "budi.s", role: "Admin Bidang", bidang: "Seksi Pendidikan Madrasah" },
    { id: 3, name: "Siti Aminah", username: "siti.a", role: "Admin Bidang", bidang: "Sub Bagian Tata Usaha" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <PageBanner
        title="Manajemen Pengguna"
        description="Kelola akun pengguna dan hak akses sistem E-Arsip"
        icon={<Users className="h-6 w-6 text-white" />}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold">Daftar Pengguna Aktif</h3>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </button>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Nama & Username</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Bidang / Seksi</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === 'Super Admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {u.role === 'Super Admin' && <Shield className="mr-1 h-3 w-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.bidang}</td>
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
