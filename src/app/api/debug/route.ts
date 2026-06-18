import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const logs: Record<string, unknown>[] = []

  // Fetch all bidang
  const { data: bidangList } = await supabaseAdmin.from('bidang').select('*')
  
  // Fetch users
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  // Filter users matching kemenagbarut.go.id
  const targetUsers = users.filter(u => u.email && u.email.endsWith('@kemenagbarut.go.id'))

  for (const user of targetUsers) {
    const oldEmail = user.email!
    const newEmail = oldEmail.replace('@kemenagbarut.go.id', '@kemenag.go.id')

    // 1. Update email in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email: newEmail })
    
    if (updateError) {
      logs.push({ email: oldEmail, status: 'Failed to update email', error: updateError.message })
      continue
    }

    // Determine the bidang by matching name
    let bidangMatch = null
    const namePrefix = oldEmail.split('@')[0].replace('admin.', '').toLowerCase()
    
    if (bidangList) {
      bidangMatch = bidangList.find(b => b.name.toLowerCase().includes(namePrefix))
      
      // Handle edge cases
      if (!bidangMatch && namePrefix === 'pdpontren') bidangMatch = bidangList.find(b => b.name.toLowerCase().includes('pontren'))
      if (!bidangMatch && namePrefix === 'penmad') bidangMatch = bidangList.find(b => b.name.toLowerCase().includes('madrasah'))
      if (!bidangMatch && namePrefix === 'zawa') bidangMatch = bidangList.find(b => b.name.toLowerCase().includes('zakat') || b.name.toLowerCase().includes('wakaf'))
      if (!bidangMatch && namePrefix === 'pais') bidangMatch = bidangList.find(b => b.name.toLowerCase().includes('agama islam'))
    }

    // 2. Upsert to users_metadata
    if (bidangMatch) {
      const { error: metaError } = await supabaseAdmin.from('users_metadata').upsert({
        id: user.id,
        username: namePrefix,
        full_name: `Admin ${bidangMatch.name}`,
        role: 'Admin Seksi Bidang',
        bidang_id: bidangMatch.id
      })
      
      logs.push({ 
        oldEmail, 
        newEmail, 
        status: 'Success', 
        bidangAssigned: bidangMatch.name,
        metaError: metaError ? metaError.message : null 
      })
    } else {
      logs.push({ 
        oldEmail, 
        newEmail, 
        status: 'Email updated but no Bidang matched', 
        namePrefix 
      })
    }
  }

  return NextResponse.json({ logs, summary: `Processed ${targetUsers.length} users` })
}
