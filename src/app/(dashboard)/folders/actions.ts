"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createFolder(name: string, parentId: string | null) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // Get user metadata to know which bidang this belongs to
    const { data: metadata, error: metaError } = await supabase
      .from('users_metadata')
      .select('bidang_id, role')
      .eq('id', user.id)
      .single()

    if (metaError || !metadata) throw new Error("Metadata user tidak ditemukan")

    // Insert folder
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        parent_id: parentId === 'root' ? null : parentId,
        bidang_id: metadata.bidang_id, // Might be null for Super Admin, they can create global folders or we need UI to pick. For now, assign user's bidang.
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/folders/${parentId || 'root'}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error creating folder:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function saveFileMetadata({
  name,
  folderId,
  r2ObjectKey,
  mimeType,
  sizeBytes,
}: {
  name: string
  folderId: string | null
  r2ObjectKey: string
  mimeType: string
  sizeBytes: number
}) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // Get user metadata
    const { data: metadata, error: metaError } = await supabase
      .from('users_metadata')
      .select('bidang_id, role')
      .eq('id', user.id)
      .single()

    if (metaError || !metadata) throw new Error("Metadata user tidak ditemukan")

    // Insert file metadata
    const { data, error } = await supabase
      .from('files')
      .insert({
        name,
        folder_id: folderId === 'root' ? null : folderId,
        bidang_id: metadata.bidang_id,
        r2_object_key: r2ObjectKey,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/folders/${folderId || 'root'}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error saving file metadata:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function deleteItem(id: string, type: "folder" | "file", folderId: string | null) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    const table = type === "folder" ? "folders" : "files"
    
    // If it's a file, also remove from storage
    if (type === "file") {
      const { data: fileData } = await supabase
        .from('files')
        .select('r2_object_key')
        .eq('id', id)
        .single()

      if (fileData?.r2_object_key) {
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_ARSIP_BUCKET || "Files-arsip"
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([fileData.r2_object_key])

        if (storageError) {
          console.error("Storage delete failed (non-fatal):", storageError)
        }
      }
    }
    
    const { error } = await supabase
      .from(table)
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      
    if (error) throw error

    revalidatePath(`/folders/${folderId || 'root'}`)
    return { success: true }
  } catch (error) {
    console.error(`Error deleting ${type}:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function renameItem(id: string, type: "folder" | "file", newName: string, folderId: string | null) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    const table = type === "folder" ? "folders" : "files"
    
    const { error } = await supabase
      .from(table)
      .update({ 
        name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      
    if (error) throw error

    revalidatePath(`/folders/${folderId || 'root'}`)
    return { success: true }
  } catch (error) {
    console.error(`Error renaming ${type}:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function moveItem(itemId: string, itemType: "folder" | "file", targetFolderId: string | null, currentFolderId: string | null) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // Prevent moving a folder into itself (basic check)
    if (itemType === "folder" && itemId === targetFolderId) {
      throw new Error("Tidak dapat memindahkan folder ke dalam dirinya sendiri")
    }

    const table = itemType === "folder" ? "folders" : "files"
    const columnToUpdate = itemType === "folder" ? "parent_id" : "folder_id"
    
    const { error } = await supabase
      .from(table)
      .update({ 
        [columnToUpdate]: targetFolderId === 'root' ? null : targetFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      
    if (error) throw error

    revalidatePath(`/folders/${currentFolderId || 'root'}`)
    if (targetFolderId !== currentFolderId) {
      revalidatePath(`/folders/${targetFolderId || 'root'}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error(`Error moving ${itemType}:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function getFoldersByBidang() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    const { data: metadata, error: metaError } = await supabase
      .from('users_metadata')
      .select('bidang_id, role')
      .eq('id', user.id)
      .single()

    if (metaError || !metadata) throw new Error("Metadata user tidak ditemukan")

    const query = supabase
      .from('folders')
      .select('id, name, parent_id')
      .is('deleted_at', null)

    // For safety, only show their bidang's folders (unless logic dictates otherwise)
    // Actually SUPER_ADMIN might want to see all, but let's stick to what's mapped to them
    if (metadata.bidang_id) {
      query.eq('bidang_id', metadata.bidang_id)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error(`Error fetching folders:`, error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
