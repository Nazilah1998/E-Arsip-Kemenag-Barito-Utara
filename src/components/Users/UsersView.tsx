"use client"

import { useState } from "react"
import { Plus, Pencil, Shield, Trash2, Zap } from "lucide-react"
import { AddUserModal } from "./AddUserModal"
import { EditUserModal } from "./EditUserModal"
import { DeleteUserModal } from "./DeleteUserModal"
import { migrateEmailsAndRoles, deleteUser } from "@/app/(dashboard)/users/actions"

interface Bidang {
  id: string
  name: string
}

interface User {
  id: string
  username: string
  full_name: string
  role: string
  bidang: string | null
}

interface UsersViewProps {
  initialUsers: User[]
  bidangList: Bidang[]
  isSuperAdmin: boolean
}

export function UsersView({ initialUsers, bidangList, isSuperAdmin }: UsersViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleMigrate = async () => {
    if (!confirm("Update email admin menjadi @kemenag.go.id dan atur sebagai Admin Seksi Bidang?")) return
    setIsMigrating(true)
    const res = await migrateEmailsAndRoles()
    if (res.success) {
      alert("Migrasi berhasil! Cek console log jika perlu rincian.")
      console.log(res.logs)
    } else {
      alert("Gagal: " + res.error)
    }
    setIsMigrating(false)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    const result = await deleteUser(userToDelete.id)
    setIsDeleting(false)
    if (result.success) {
      setUserToDelete(null)
    } else {
      alert("Gagal menghapus pengguna: " + result.error)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-8 py-6 gap-4">
          <h3 className="text-lg font-bold text-slate-900">Daftar Pengguna Aktif</h3>
          
          {isSuperAdmin && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleMigrate}
                disabled={isMigrating}
                className="flex w-fit items-center gap-2 rounded-xl bg-orange-100 px-5 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition-all hover:bg-orange-200 disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {isMigrating ? "Memproses..." : "Migrasi Email Admin"}
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengguna
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm border-collapse">
            <thead className="bg-slate-50/90 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="border-b border-slate-100 px-8 py-4">Nama & Username</th>
                <th className="border-b border-slate-100 px-8 py-4">Role</th>
                <th className="border-b border-slate-100 px-8 py-4">Bidang / Seksi</th>
                {isSuperAdmin && <th className="border-b border-slate-100 px-8 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 4 : 3} className="px-8 py-8 text-center text-slate-500 font-medium">
                    Belum ada pengguna
                  </td>
                </tr>
              ) : (
                initialUsers.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">{u.full_name}</div>
                          <div className="text-[11px] font-bold tracking-widest text-slate-400">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset ${
                        u.role === 'Super Admin' 
                          ? 'bg-purple-50 text-purple-700 ring-purple-200' 
                          : 'bg-blue-50 text-blue-700 ring-blue-200'
                      }`}>
                        {u.role === 'Super Admin' && <Shield className="mr-1.5 h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-500">
                      {u.bidang || "-"}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setUserToEdit(u)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100" 
                            title="Edit Pengguna"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => setUserToDelete(u)}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100" 
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        bidangList={bidangList} 
      />

      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        bidangList={bidangList}
        user={userToEdit}
      />

      <DeleteUserModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.full_name || ""}
        isDeleting={isDeleting}
      />
    </>
  )
}
