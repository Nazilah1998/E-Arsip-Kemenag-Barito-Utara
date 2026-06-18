"use client"

import { Building2, KeyRound, User as UserIcon } from "lucide-react"

export default function LoginPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="bg-primary px-6 py-10 text-center text-primary-foreground">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">E-Arsip Kemenag</h1>
          <p className="text-primary-foreground/80 mt-2 text-sm">
            Kabupaten Barito Utara
          </p>
        </div>

        <div className="p-6 md:p-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Masukkan username"
                  type="text"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Masukkan password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Turnstile Mock */}
            <div className="flex h-[78px] w-full items-center justify-center rounded-md border border-dashed bg-muted/50">
              <span className="text-xs text-muted-foreground">
                [Cloudflare Turnstile Widget]
              </span>
            </div>

            <button
              className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              type="submit"
            >
              Masuk Sistem
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
