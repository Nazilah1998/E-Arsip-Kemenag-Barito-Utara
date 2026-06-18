import { PageBanner } from "@/components/ui/PageBanner"
import { FolderOpen } from "lucide-react"
import { FileBrowserView } from "@/components/FileBrowser/FileBrowserView"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function FolderPage({ params }: { params: Promise<{ folderId: string }> | { folderId: string } }) {
  // In Next.js 15, params is a Promise
  const resolvedParams = await params
  const { folderId } = resolvedParams
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: metadata } = await supabase.from('users_metadata').select('bidang_id').eq('id', user.id).single()
  const userBidangId = metadata?.bidang_id || 'global'

  // Fetch folders
  let foldersQuery = supabase.from('folders').select('*').is('deleted_at', null)
  if (folderId === 'root') {
    foldersQuery = foldersQuery.is('parent_id', null)
  } else {
    foldersQuery = foldersQuery.eq('parent_id', folderId)
  }
  const { data: folders = [] } = await foldersQuery.order('name')

  // Fetch files
  let filesQuery = supabase.from('files').select('*').is('deleted_at', null)
  if (folderId === 'root') {
    filesQuery = filesQuery.is('folder_id', null)
  } else {
    filesQuery = filesQuery.eq('folder_id', folderId)
  }
  const { data: files = [] } = await filesQuery.order('created_at', { ascending: false })

  // Format data for FileTable
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const items = [
    ...(folders || []).map(f => ({
      id: f.id,
      name: f.name,
      type: "folder" as const,
      updatedAt: new Date(f.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      isRestricted: f.is_restricted || false
    })),
    ...(files || []).map(f => ({
      id: f.id,
      name: f.name,
      type: "file" as const,
      mimeType: f.mime_type,
      size: formatFileSize(f.size_bytes),
      updatedAt: new Date(f.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      isRestricted: f.is_restricted || false,
      objectKey: f.r2_object_key
    }))
  ]

  // Breadcrumbs
  const breadcrumbs = [
    { id: "root", name: "Root" }
  ]
  
  if (folderId !== 'root') {
    const { data: currentFolder } = await supabase.from('folders').select('name').eq('id', folderId).single()
    if (currentFolder) {
      breadcrumbs.push({ id: folderId, name: currentFolder.name })
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageBanner
        title="File Browser"
        description="Jelajahi dan kelola dokumen pada seksi/bidang Anda"
        icon={<FolderOpen className="h-8 w-8 text-white" />}
      />

      <FileBrowserView 
        folderId={folderId} 
        initialItems={items} 
        breadcrumbs={breadcrumbs}
        userBidangId={userBidangId}
      />
    </div>
  )
}
