import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  id: string
  name: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link 
        href="/folders/root" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={item.id} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <Link
              href={`/folders/${item.id}`}
              className={`truncate max-w-[150px] transition-colors hover:text-foreground ${
                isLast ? "font-medium text-foreground pointer-events-none" : ""
              }`}
              aria-current={isLast ? "page" : undefined}
            >
              {item.name}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
