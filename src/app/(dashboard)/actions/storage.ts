"use server"

import { createClient } from "@/lib/supabase/server"

export async function getStorageUsage() {
  try {
    const supabase = await createClient()

    // Ambil semua file yang tidak terhapus
    // Jika RLS aktif, ini otomatis hanya akan mengambil file yang dapat diakses user
    const { data: files, error } = await supabase
      .from('files')
      .select('size_bytes')
      .is('deleted_at', null)

    if (error) {
      console.error("Error fetching storage usage:", error)
      return { success: false, usedBytes: 0, error: error.message }
    }

    const usedBytes = (files || []).reduce((acc, f) => acc + (f.size_bytes || 0), 0)
    
    // Sebagai contoh sementara, kita asumsikan limit kuota adalah 15 GB (15 * 1024 * 1024 * 1024)
    const QUOTA_GB = 15
    const limitBytes = QUOTA_GB * 1024 * 1024 * 1024
    
    return { 
      success: true, 
      usedBytes, 
      limitBytes,
      percentage: Math.min((usedBytes / limitBytes) * 100, 100)
    }
  } catch (error) {
    console.error("Storage usage error:", error)
    return { success: false, usedBytes: 0, limitBytes: 1, percentage: 0, error: "Internal Error" }
  }
}
