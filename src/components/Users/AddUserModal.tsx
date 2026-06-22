"use client"

import { useState } from "react"
import { X, UserPlus, Loader2, Eye, EyeOff } from "lucide-react"
import { addUser } from "@/app/(dashboard)/users/actions"
import { ModernSelect } from "@/components/ui/ModernSelect"

interface Bidang {
  id: string
  name: string
}

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  bidangList: Bidang[]
}

export function AddUserModal({ isOpen, onClose, bidangList }: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState("Admin Bidang")
  const [bidangId, setBidangId] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    // Additional validation
    if (role === "Admin Bidang" && !formData.get("bidangId")) {
      setError("Pilih bidang/seksi untuk Admin Bidang")
      setIsLoading(false)
      return
    }

    const result = await addUser(formData)
    
    setIsLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-in zoom-in-95 rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Tambah Pengguna</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Contoh: ahmad.d"
                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi minimal 6 karakter"
                  minLength={6}
                  className="w-full rounded-xl border-0 bg-slate-50 pl-4 pr-12 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                Hak Akses (Role)
              </label>
              <ModernSelect
                name="role"
                id="role"
                value={role}
                onChange={(val) => setRole(val)}
                options={[
                  { value: 'Admin Bidang', label: 'Admin Bidang (Hanya akses bidangnya)' },
                  { value: 'Super Admin', label: 'Super Admin (Akses penuh)' }
                ]}
              />
            </div>

            {/* Bidang/Seksi Selection - Only show if Admin Bidang */}
            {role === "Admin Bidang" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label htmlFor="bidangId" className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Seksi / Bidang
                </label>
                <ModernSelect
                  name="bidangId"
                  id="bidangId"
                  value={bidangId}
                  onChange={(val) => setBidangId(val)}
                  placeholder="-- Pilih Bidang --"
                  required
                  options={bidangList.map(b => ({ value: b.id, label: b.name }))}
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 font-medium border border-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Pengguna"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
