export interface FileItem {
  id: string
  name: string
  type: "folder" | "file"
  mimeType?: string
  size?: string
  updatedAt: string
  rawDate?: string
  isRestricted: boolean
  objectKey?: string
}

export interface BreadcrumbItem {
  id: string
  name: string
}

export interface FileBrowserViewProps {
  folderId: string
  initialItems: FileItem[]
  breadcrumbs: BreadcrumbItem[]
  userBidangId: string
}

export interface UploadItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}
