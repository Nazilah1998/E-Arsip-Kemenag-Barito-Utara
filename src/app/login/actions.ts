'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: { error: string | null } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const turnstileToken = formData.get('cf-turnstile-response') as string

  // Validasi input dasar
  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  // 1. Validasi Turnstile
  if (!turnstileToken) {
    return { error: 'Validasi keamanan gagal. Silakan centang kotak "I am human".' }
  }

  const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

  try {
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${SECRET_KEY}&response=${turnstileToken}`,
      }
    )

    const turnstileResult = await turnstileResponse.json()

    if (!turnstileResult.success) {
      return { error: 'Sistem mendeteksi aktivitas mencurigakan. Silakan muat ulang halaman.' }
    }
  } catch {
    return { error: 'Terjadi kesalahan jaringan saat memvalidasi keamanan.' }
  }

  // 2. Autentikasi dengan Supabase
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email atau password yang Anda masukkan salah.' }
  }

  // Jika sukses, redirect ke dashboard
  redirect('/')
}
