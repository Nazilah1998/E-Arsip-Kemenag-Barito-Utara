"use client"

import { LogOut, User as UserIcon, Menu } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center">
        {/* Tombol menu untuk mobile */}
        <button 
          onClick={onMenuClick}
          className="mr-4 text-slate-500 hover:text-slate-700 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:block">
          {/* Breadcrumb atau Info tambahan bisa ditaruh di sini nantinya */}
          <span className="text-sm font-medium text-slate-500">Panel Kendali Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 shadow-sm transition-all hover:bg-slate-100 hover:shadow"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-[11px] font-bold leading-none text-slate-700">Admin Name</span>
              <span className="text-[10px] text-slate-500 mt-1">Super Admin</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-3 py-2 sm:hidden border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-700">Admin Name</p>
                <p className="text-[10px] text-slate-500">Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
