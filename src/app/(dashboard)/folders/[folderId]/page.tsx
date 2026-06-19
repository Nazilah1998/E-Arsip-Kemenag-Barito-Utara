import { PageBanner } from "@/components/ui/PageBanner"
import { FolderOpen } from "lucide-react"
import { FileBrowserView } from "@/components/FileBrowser/FileBrowserView"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatFileSize } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy", { locale: id })
  }

  // Fetch all folders and files for size calculation and breadcrumbs (lightweight fetch)
  const { data: allFoldersData } = await supabase.from('folders').select('id, parent_id, name').is('deleted_at', null)
  const { data: allFilesData } = await supabase.from('files').select('folder_id, size_bytes').is('deleted_at', null)

  const buildSizeMap = () => {
    const sizeMap: Record<string, number> = {}
    const childrenMap: Record<string, string[]> = {}
    
    // Initialize
    allFoldersData?.forEach(f => {
      sizeMap[f.id] = 0
      childrenMap[f.id] = []
    })
    
    // Build tree
    allFoldersData?.forEach(f => {
      if (f.parent_id && childrenMap[f.parent_id]) {
        childrenMap[f.parent_id].push(f.id)
      }
    })
    
    // Add file sizes directly to their folders
    allFilesData?.forEach(file => {
      if (file.folder_id && sizeMap[file.folder_id] !== undefined) {
        sizeMap[file.folder_id] += (file.size_bytes || 0)
      }
    })
    
    // Compute total sizes bottom-up
    const computed = new Set<string>()
    const computeFolder = (fId: string): number => {
      if (computed.has(fId)) return sizeMap[fId]
      
      let total = sizeMap[fId]
      const children = childrenMap[fId] || []
      for (const childId of children) {
        total += computeFolder(childId)
      }
      
      sizeMap[fId] = total
      computed.add(fId)
      return total
    }
    
    allFoldersData?.forEach(f => computeFolder(f.id))
    
    return sizeMap
  }

  const folderSizeMap = buildSizeMap()

  const items = [
    ...(folders || []).map(f => {
      const folderSize = folderSizeMap[f.id] || 0
      return {
        id: f.id,
        name: f.name,
        type: "folder" as const,
        size: folderSize > 0 ? formatFileSize(folderSize) : "-",
        updatedAt: formatDate(f.updated_at),
        rawDate: f.updated_at,
        isRestricted: f.is_restricted || false
      }
    }),
    ...(files || []).map(f => ({
      id: f.id,
      name: f.name,
      type: "file" as const,
      mimeType: f.mime_type,
      size: formatFileSize(f.size_bytes),
      updatedAt: formatDate(f.updated_at),
      rawDate: f.updated_at,
      isRestricted: f.is_restricted || false,
      objectKey: f.r2_object_key
    }))
  ]

  // Breadcrumbs
  const breadcrumbs = [
    { id: "root", name: "Root" }
  ]
  
  if (folderId !== 'root') {
    const buildBreadcrumbs = (currentId: string) => {
      const paths = []
      let curr = allFoldersData?.find(f => f.id === currentId)
      while (curr) {
        paths.unshift({ id: curr.id, name: curr.name })
        const parentId = curr.parent_id
        if (parentId) {
          curr = allFoldersData?.find(f => f.id === parentId)
        } else {
          break
        }
      }
      return paths
    }
    
    breadcrumbs.push(...buildBreadcrumbs(folderId))
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
