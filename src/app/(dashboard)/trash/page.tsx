import { PageBanner } from "@/components/ui/PageBanner"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TrashView } from "@/components/Trash/TrashView"

interface TrashItem {
  id: string
  name: string
  type: "folder" | "file"
  deletedAt: string
  expiresAt: string
}

export default async function TrashPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch deleted folders
  const { data: foldersData } = await supabase
    .from('folders')
    .select('id, name, deleted_at')
    .not('deleted_at', 'is', null)

  // Fetch deleted files
  const { data: filesData } = await supabase
    .from('files')
    .select('id, name, deleted_at')
    .not('deleted_at', 'is', null)

  const trashItems: TrashItem[] = []

  if (foldersData) {
    foldersData.forEach(f => {
      trashItems.push({
        id: f.id,
        name: f.name,
        type: "folder",
        deletedAt: new Date(f.deleted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        expiresAt: "-" // Calculation logic could be added here
      })
    })
  }

  if (filesData) {
    filesData.forEach(f => {
      trashItems.push({
        id: f.id,
        name: f.name,
        type: "file",
        deletedAt: new Date(f.deleted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        expiresAt: "-"
      })
    })
  }

  // Sort by deleted_at descending
  trashItems.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime())

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageBanner
        title="Recycle Bin (Trash)"
        description="Dokumen yang dihapus akan tersimpan di sini sebelum dihapus permanen"
        icon={<Trash2 className="h-8 w-8 text-white" />}
      />

      <TrashView initialData={trashItems} />
    </div>
  )
}
