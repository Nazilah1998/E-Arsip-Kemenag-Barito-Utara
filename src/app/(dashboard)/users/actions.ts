"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"

// We use the admin client to bypass RLS and create users in Auth
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'kemenag_arsip'
      }
    }
  )
}

export async function addUser(formData: FormData) {
  try {
    // 1. Verify current user is Super Admin
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()
    
    if (authError || !user) throw new Error("Unauthorized")

    const { data: currentUserMeta } = await supabaseServer
      .from('users_metadata')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUserMeta?.role !== 'Super Admin') {
      throw new Error("Hanya Super Admin yang dapat menambahkan pengguna baru")
    }

    // 2. Parse form data
    const fullName = formData.get("fullName") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const bidangId = formData.get("bidangId") as string

    if (!fullName || !username || !password || !role) {
      throw new Error("Semua field wajib diisi")
    }

    const adminAuthClient = getAdminClient()

    // 3. Create user in Supabase Auth
    // We use a dummy email based on username since Supabase Auth requires email
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@arsip.kemenag.local`

    const { data: newAuthUser, error: createAuthError } = await adminAuthClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: username,
      }
    })

    if (createAuthError) {
      if (createAuthError.message.includes("already registered")) {
        throw new Error("Username ini sudah digunakan")
      }
      throw new Error("Gagal membuat akun auth: " + createAuthError.message)
    }

    if (!newAuthUser.user) throw new Error("Gagal mendapatkan data user baru")

    // 4. Insert into users_metadata using Admin Client (since Super Admin might not have RLS permission to insert without policy, wait, Super Admin has ALL policy, but we can just use admin client to be safe)
    const { error: insertMetaError } = await adminAuthClient
      .from('users_metadata')
      .insert({
        id: newAuthUser.user.id,
        username: username,
        full_name: fullName,
        role: role,
        bidang_id: role === 'Admin Bidang' && bidangId ? bidangId : null,
      })

    if (insertMetaError) {
      // Rollback auth user creation if metadata insert fails
      await adminAuthClient.auth.admin.deleteUser(newAuthUser.user.id)
      throw new Error("Gagal menyimpan profil pengguna: " + insertMetaError.message)
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error in addUser:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}


export async function deleteUser(userId: string) {
  try {
    const supabaseServer = await createServerClient()
    const adminAuthClient = getAdminClient()
    
    // Check if Super Admin
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: currentUserMeta } = await supabaseServer
      .from('users_metadata')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUserMeta?.role !== 'Super Admin') {
      throw new Error("Hanya Super Admin yang dapat menghapus pengguna")
    }

    if (userId === user.id) {
      throw new Error("Anda tidak dapat menghapus akun Anda sendiri")
    }

    // 1. Delete from users_metadata first
    const { error: metaError } = await adminAuthClient
      .from('users_metadata')
      .delete()
      .eq('id', userId)

    if (metaError) {
      throw new Error("Gagal menghapus profil pengguna: " + metaError.message)
    }

    // 2. Delete from auth.users
    const { error: authError } = await adminAuthClient.auth.admin.deleteUser(userId)
    
    if (authError) {
      throw new Error("Gagal menghapus autentikasi: " + authError.message)
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const supabaseServer = await createServerClient()
    const adminAuthClient = getAdminClient()
    
    // Check if Super Admin
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: currentUserMeta } = await supabaseServer
      .from('users_metadata')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUserMeta?.role !== 'Super Admin') {
      throw new Error("Hanya Super Admin yang dapat mengedit pengguna")
    }

    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string
    const bidangId = formData.get("bidangId") as string
    const password = formData.get("password") as string

    if (!fullName || !role) {
      throw new Error("Nama dan Role wajib diisi")
    }

    // 1. Update users_metadata
    const { error: metaError } = await adminAuthClient
      .from('users_metadata')
      .update({
        full_name: fullName,
        role: role,
        bidang_id: role === 'Admin Bidang' && bidangId ? bidangId : null,
      })
      .eq('id', userId)

    if (metaError) {
      throw new Error("Gagal mengupdate profil pengguna: " + metaError.message)
    }

    // 2. Update password if provided
    if (password && password.trim() !== '') {
      const { error: authError } = await adminAuthClient.auth.admin.updateUserById(userId, {
        password: password
      })
      
      if (authError) {
        throw new Error("Gagal mengupdate kata sandi: " + authError.message)
      }
    }

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
