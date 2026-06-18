"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderIcon, LayoutDashboard, Trash2, Users, Building2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "File Browser", href: "/folders/root", icon: FolderIcon },
  { name: "Recycle Bin", href: "/trash", icon: Trash2 },
  { name: "Manajemen Bidang", href: "/bidang", icon: Building2 },
  { name: "Manajemen Pengguna", href: "/users", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-3 py-4">
      <div className="mb-8 px-4">
        <h2 className="text-xl font-bold tracking-tight text-primary">
          E-Arsip Kemenag
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Barito Utara</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t pt-4">
        <div className="mb-4 px-3">
          <div className="text-sm font-medium">Admin Name</div>
          <div className="text-xs text-muted-foreground">Super Admin</div>
        </div>
        <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  )
}
