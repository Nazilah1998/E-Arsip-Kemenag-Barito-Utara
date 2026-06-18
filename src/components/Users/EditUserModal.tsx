"use client"

import { useState, useEffect } from "react"
import { X, UserCheck, Loader2, Eye, EyeOff } from "lucide-react"
import { updateUser } from "@/app/(dashboard)/users/actions"

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
  bidang_id?: string | null
}

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  bidangList: Bidang[]
  user: User | null
}

export function EditUserModal({ isOpen, onClose, bidangList, user }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState("Admin Bidang")
  const [bidangId, setBidangId] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Initialize fields when user changes
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      setRole(user.role)
      
      // Find the bidang ID from the list if the user has a bidang name
      if (user.bidang) {
        const found = bidangList.find(b => b.name === user.bidang)
        if (found) setBidangId(found.id)
      } else {
        setBidangId("")
      }
    }
  }, [user, bidangList])

  if (!isOpen || !user) return null

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

    const result = await updateUser(user.id, formData)
    
    setIsLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md animate-in zoom-in-95 rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Edit Pengguna</h2>
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
                defaultValue={user.full_name}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {/* Username (Readonly) */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username <span className="text-xs font-normal text-slate-400">(Tidak dapat diubah)</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={user.username}
                disabled
                className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-500 ring-1 ring-inset ring-slate-200 cursor-not-allowed"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                Hak Akses (Role)
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all cursor-pointer"
                required
              >
                <option value="Admin Bidang">Admin Bidang (Hanya akses bidangnya)</option>
                <option value="Super Admin">Super Admin (Akses penuh)</option>
              </select>
            </div>

            {/* Bidang/Seksi Selection - Only show if Admin Bidang */}
            {role === "Admin Bidang" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label htmlFor="bidangId" className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Seksi / Bidang
                </label>
                <select
                  id="bidangId"
                  name="bidangId"
                  value={bidangId}
                  onChange={(e) => setBidangId(e.target.value)}
                  className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all cursor-pointer"
                  required={role === "Admin Bidang"}
                >
                  <option value="">-- Pilih Bidang --</option>
                  {bidangList.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password (Optional) */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Ganti Password <span className="text-xs font-normal text-slate-400">(Kosongkan jika tidak diganti)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ketik password baru"
                  minLength={6}
                  className="w-full rounded-xl border-0 bg-slate-50 pl-4 pr-12 py-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all"
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
              className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
