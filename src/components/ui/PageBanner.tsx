import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function PageBanner({ title, description, icon, className, ...props }: PageBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-emerald-700 text-white shadow-xl shadow-emerald-900/10 transition-all",
        className
      )}
      {...props}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-800/40 blur-3xl" />
      <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      
      <div className="relative flex items-center gap-6 p-8 md:p-10 z-10">
        {icon && (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-inner ring-1 ring-white/20 backdrop-blur-md">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          {description && (
            <p className="text-emerald-50 text-sm font-medium tracking-wide md:text-base opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

