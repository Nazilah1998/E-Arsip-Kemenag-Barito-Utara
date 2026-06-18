import { PageBanner } from "@/components/ui/PageBanner"
import { Building2, Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function BidangManagementPage() {
  const supabase = await createClient()

  // Try to fetch with count relation if foreign key exists
  let bidangData: { id: string; name: string; count: number }[] = []
  
  const { data, error } = await supabase
    .from('bidang')
    .select('id, name, files(count)')
    .order('name')

  if (!error && data) {
    bidangData = data.map(b => ({
      id: b.id,
      name: b.name,
      count: b.files?.[0]?.count || 0
    }))
  } else {
    // Fallback if no foreign key is explicitly defined in PostgREST
    const { data: bidangRaw } = await supabase.from('bidang').select('id, name').order('name')
    const { data: filesData } = await supabase.from('files').select('bidang_id').is('deleted_at', null)
    
    if (bidangRaw) {
      bidangData = bidangRaw.map(b => {
        const count = filesData?.filter(f => f.bidang_id === b.id).length || 0
        return {
          id: b.id,
          name: b.name,
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

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h3 className="text-lg font-bold text-slate-900">Daftar Bidang</h3>
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30">
            <Plus className="h-4 w-4" />
            Tambah Bidang
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/90 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="border-b border-slate-100 px-8 py-4">Nama Bidang</th>
                <th className="border-b border-slate-100 px-8 py-4">Total Dokumen</th>
                <th className="border-b border-slate-100 px-8 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bidangData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-8 text-center text-slate-500 font-medium">
                    Belum ada bidang terdaftar
                  </td>
                </tr>
              ) : (
                bidangData.map((b) => (
                  <tr key={b.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-8 py-4 font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        {b.name}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-500">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {b.count} dokumen
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
