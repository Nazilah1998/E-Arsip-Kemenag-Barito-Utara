import { PageBanner } from "@/components/ui/PageBanner"
import { Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { BidangView } from "@/components/Bidang/BidangView"

export default async function BidangManagementPage() {
  const supabase = await createClient()

  // Try to fetch with count relation if foreign key exists
  let bidangData: { id: string; name: string; count: number; sort_order: number }[] = []
  
  const { data, error } = await supabase
    .from('bidang')
    .select('id, name, sort_order, files(count)')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (!error && data) {
    bidangData = data.map(b => ({
      id: b.id,
      name: b.name,
      sort_order: b.sort_order || 0,
      count: b.files?.[0]?.count || 0
    }))
  } else {
    // Fallback if no foreign key is explicitly defined in PostgREST
    const { data: bidangRaw } = await supabase.from('bidang').select('id, name, sort_order').order('sort_order', { ascending: true }).order('name', { ascending: true })
    const { data: filesData } = await supabase.from('files').select('bidang_id').is('deleted_at', null)
    
    if (bidangRaw) {
      bidangData = bidangRaw.map(b => {
        const count = filesData?.filter(f => f.bidang_id === b.id).length || 0
        return {
          id: b.id,
          name: b.name,
          sort_order: b.sort_order || 0,
          count
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageBanner
        title="Manajemen Bidang / Seksi"
        description="Kelola daftar seksi dan bidang yang terdaftar dalam sistem E-Arsip"
        icon={<Building2 className="h-8 w-8 text-white" />}
      />

      <BidangView bidangData={bidangData} />
    </div>
  )
}
