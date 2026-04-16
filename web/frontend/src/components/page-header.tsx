import type { ReactNode } from "react"

interface PageHeaderProps {
  title?: string
  children?: ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/30 bg-white/40 px-4 backdrop-blur-md dark:bg-black/20">
      {title && (
        <span className="text-sm font-semibold text-foreground">{title}</span>
      )}
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </header>
  )
}
