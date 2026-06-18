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
        "relative overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-md transition-all",
        className
      )}
      {...props}
    >
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      
      <div className="relative flex items-center gap-4 p-6 md:p-8">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-sm backdrop-blur-sm">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-primary-foreground/80 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
