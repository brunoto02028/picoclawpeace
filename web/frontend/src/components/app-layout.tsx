import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider className="flex h-dvh flex-col overflow-hidden">
        {/* Animated gradient background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-fuchsia-200/30 blur-3xl animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "1.5s" }}
          />
          <div
            className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "3s" }}
          />
          <div
            className="absolute top-1/4 left-1/2 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "0.5s" }}
          />
        </div>
        <AppHeader />

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex w-full flex-col overflow-hidden">
            <main className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="bottom-center" />
      </SidebarProvider>
    </TooltipProvider>
  )
}
