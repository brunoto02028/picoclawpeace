import { IconChevronRight } from "@tabler/icons-react"
import {
  IconAtom,
  IconCalendarEvent,
  IconChartBar,
  IconChevronsDown,
  IconChevronsUp,
  IconKey,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconListDetails,
  IconMessageCircle,
  IconSettings,
  IconSpeakerphone,
  IconSparkles,
  IconTools,
  IconUsersGroup,
} from "@tabler/icons-react"
import { Link, useRouterState } from "@tanstack/react-router"
import * as React from "react"
import { useTranslation } from "react-i18next"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSidebarChannels } from "@/hooks/use-sidebar-channels"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  translateTitle?: boolean
  iconColor?: string
  iconBg?: string
}

interface NavGroup {
  label: string
  defaultOpen: boolean
  items: NavItem[]
  isChannelsGroup?: boolean
}

const baseNavGroups: Omit<NavGroup, "items">[] = [
  { label: "navigation.overview", defaultOpen: true },
  { label: "navigation.chat", defaultOpen: true },
  { label: "navigation.model_group", defaultOpen: true },
  { label: "navigation.agent_group", defaultOpen: true },
  { label: "navigation.services", defaultOpen: true },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState()
  const { i18n, t } = useTranslation()
  const { isMobile, setOpenMobile } = useSidebar()
  const currentPath = routerState.location.pathname

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false)
  }
  const {
    channelItems,
    hasMoreChannels,
    showAllChannels,
    toggleShowAllChannels,
  } = useSidebarChannels({
    language: (i18n.resolvedLanguage ?? i18n.language ?? "").toLowerCase(),
    t,
  })

  const navGroups: NavGroup[] = React.useMemo(() => {
    return [
      {
        ...baseNavGroups[0],
        items: [
          {
            title: "navigation.dashboard",
            url: "/dashboard",
            icon: IconLayoutDashboard,
            translateTitle: true,
            iconColor: "text-violet-500",
            iconBg: "bg-violet-500/10",
          },
          {
            title: "Tasks",
            url: "/tasks",
            icon: IconLayoutKanban,
            translateTitle: false,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
          },
          {
            title: "Agenda",
            url: "/agenda",
            icon: IconCalendarEvent,
            translateTitle: false,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-500/10",
          },
          {
            title: "Campanhas",
            url: "/campanhas",
            icon: IconSpeakerphone,
            translateTitle: false,
            iconColor: "text-orange-500",
            iconBg: "bg-orange-500/10",
          },
          {
            title: "Insights",
            url: "/insights",
            icon: IconChartBar,
            translateTitle: false,
            iconColor: "text-fuchsia-500",
            iconBg: "bg-fuchsia-500/10",
          },
          {
            title: "Contas",
            url: "/contas",
            icon: IconUsersGroup,
            translateTitle: false,
            iconColor: "text-indigo-500",
            iconBg: "bg-indigo-500/10",
          },
        ],
      },
      {
        ...baseNavGroups[1],
        items: [
          {
            title: "navigation.chat",
            url: "/",
            icon: IconMessageCircle,
            translateTitle: true,
            iconColor: "text-pink-500",
            iconBg: "bg-pink-500/10",
          },
        ],
      },
      {
        ...baseNavGroups[2],
        items: [
          {
            title: "navigation.models",
            url: "/models",
            icon: IconAtom,
            translateTitle: true,
            iconColor: "text-cyan-500",
            iconBg: "bg-cyan-500/10",
          },
          {
            title: "navigation.credentials",
            url: "/credentials",
            icon: IconKey,
            translateTitle: true,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
          },
        ],
      },
      {
        label: "navigation.channels_group",
        defaultOpen: true,
        items: channelItems.map((item) => ({
          title: item.title,
          url: item.url,
          icon: item.icon,
          translateTitle: false,
          iconColor: "text-indigo-500",
          iconBg: "bg-indigo-500/10",
        })),
        isChannelsGroup: true,
      },
      {
        ...baseNavGroups[3],
        items: [
          {
            title: "navigation.skills",
            url: "/agent/skills",
            icon: IconSparkles,
            translateTitle: true,
            iconColor: "text-yellow-500",
            iconBg: "bg-yellow-500/10",
          },
          {
            title: "navigation.tools",
            url: "/agent/tools",
            icon: IconTools,
            translateTitle: true,
            iconColor: "text-teal-500",
            iconBg: "bg-teal-500/10",
          },
        ],
      },
      {
        ...baseNavGroups[4],
        items: [
          {
            title: "navigation.config",
            url: "/config",
            icon: IconSettings,
            translateTitle: true,
            iconColor: "text-slate-500",
            iconBg: "bg-slate-500/10",
          },
          {
            title: "navigation.logs",
            url: "/logs",
            icon: IconListDetails,
            translateTitle: true,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-500/10",
          },
        ],
      },
    ]
  }, [channelItems])

  return (
    <Sidebar
      {...props}
      className="border-r border-white/30 bg-white/60 backdrop-blur-xl pt-3 dark:bg-black/40 dark:border-white/10"
    >
      <SidebarContent className="bg-transparent">
        {navGroups.map((group) => (
          <Collapsible
            key={group.label}
            defaultOpen={group.defaultOpen}
            className="group/collapsible mb-1"
          >
            <SidebarGroup className="px-2 py-0">
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/10">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {t(group.label)}
                </span>
                <IconChevronRight className="size-3.5 opacity-40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="pt-1">
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive =
                        currentPath === item.url ||
                        (item.url !== "/" &&
                          currentPath.startsWith(`${item.url}/`))
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`h-9 rounded-xl px-2.5 transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-purple-500/15 to-fuchsia-500/10 text-foreground font-semibold shadow-sm border border-purple-500/20"
                                : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
                            }`}
                          >
                            <Link to={item.url} onClick={handleNavClick}>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                                  isActive ? (item.iconBg ?? "bg-violet-500/10") : ""
                                }`}
                              >
                                <item.icon
                                  className={`size-3.5 ${
                                    isActive
                                      ? (item.iconColor ?? "text-violet-500")
                                      : "text-muted-foreground/70"
                                  }`}
                                />
                              </span>
                              <span>
                                {item.translateTitle ? t(item.title) : item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                    {group.isChannelsGroup && hasMoreChannels && (
                      <SidebarMenuItem key="channels-more-toggle">
                        <SidebarMenuButton
                          onClick={toggleShowAllChannels}
                          className="text-muted-foreground hover:bg-white/50 h-9 rounded-xl px-2.5"
                        >
                          {showAllChannels ? (
                            <IconChevronsUp className="size-4 opacity-60" />
                          ) : (
                            <IconChevronsDown className="size-4 opacity-60" />
                          )}
                          <span className="opacity-80">
                            {showAllChannels
                              ? t("navigation.show_less_channels")
                              : t("navigation.show_more_channels")}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
