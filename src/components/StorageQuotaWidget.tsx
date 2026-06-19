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
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  const isAlmostFull = data.percentage > 85
  const isFull = data.percentage >= 100

  return (
    <div className="mt-4 rounded-xl bg-slate-800/40 p-4 border border-slate-700/30">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-bold tracking-wide text-slate-300 uppercase">Penyimpanan</span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isFull ? 'bg-rose-500' : isAlmostFull ? 'bg-orange-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(data.percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span>{formatFileSize(data.used)} terpakai</span>
        <span>{formatFileSize(data.limit)}</span>
      </div>
    </div>
  )
}
