"use client"

import { useState } from "react"
import { Toaster } from "sonner"
import { Sidebar } from "@/components/Sidebar"
import { TopNavbar } from "@/components/TopNavbar"

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="relative flex w-full max-w-xs flex-1 transform transition-transform duration-300 ease-in-out">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { borderRadius: '12px', fontWeight: 600 },
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* Dihapus max-w-7xl agar full width */}
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
