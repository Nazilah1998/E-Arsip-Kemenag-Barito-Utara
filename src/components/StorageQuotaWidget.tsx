"use client"

import { useEffect, useState } from "react"
import { Cloud, Loader2 } from "lucide-react"
import { getStorageUsage } from "@/app/(dashboard)/actions/storage"
import { formatFileSize } from "@/lib/utils"

export function StorageQuotaWidget() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ used: number; limit: number; percentage: number }>({
    used: 0,
    limit: 15 * 1024 * 1024 * 1024,
    percentage: 0
  })

  useEffect(() => {
    async function fetchData() {
      const res = await getStorageUsage()
      if (res.success) {
        setData({
          used: res.usedBytes || 0,
          limit: res.limitBytes || 1,
          percentage: res.percentage || 0
        })
      }
      setLoading(false)
    }
    
    fetchData()

    const handleStorageChange = () => fetchData()
    window.addEventListener('storage-updated', handleStorageChange)
    return () => window.removeEventListener('storage-updated', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }


  return (
    <div className="mt-4 rounded-xl bg-slate-800/40 p-4 border border-slate-700/30">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-bold tracking-wide text-slate-300 uppercase">Penyimpanan</span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2 relative">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
          style={{ width: `${Math.max(1, Math.min((data.used / (1024 * 1024 * 1024 * 1024)) * 100, 100))}%` }} 
          // visual bar comparing usage to 1 Terabyte instead of 15GB
        />
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span>{formatFileSize(data.used)} terpakai</span>
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
          Unlimited
        </span>
      </div>
    </div>
  )
}
