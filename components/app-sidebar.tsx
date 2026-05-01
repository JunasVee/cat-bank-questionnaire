"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  ListTodo,
  TrendingUp,
  Bell,
  BookOpen,
  BarChart2,
  FileText,
  CheckSquare,
  Send,
  ClipboardList,
  History,
  PlayCircle,
  Clock,
  Award,
  FilePlus,
  Layers,
  Map,
  Target,
  GitBranch,
  PlusCircle,
  Inbox,
  Calendar,
  CalendarCheck,
  CalendarDays,
  BarChart,
  FileBarChart,
  FileBadge,
  LineChart,
  MailOpen,
  Megaphone,
  HelpCircle,
  ArrowLeftRight,
  Trophy,
  Database,
  FileQuestion,
  GitMerge,
  Mail,
  Users,
  Shield,
  Building,
  Settings,
  Settings2,
  Link2,
  ScrollText,
  Star,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

/* ─────────────── Menu config ─────────────── */

const EMPLOYEE_MENUS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "My Task", href: "/dashboard/tasks", icon: ListTodo },
      { title: "Program Progress", href: "/dashboard/progress", icon: TrendingUp },
      { title: "Notification", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    title: "Skill Management",
    icon: BookOpen,
    items: [
      { title: "My Skills", href: "/skills", icon: Star },
      { title: "Skill Progress", href: "/skills/progress", icon: BarChart2 },
      { title: "Skill Detail", href: "/skills/detail", icon: FileText },
    ],
  },
  {
    title: "Skill Validation",
    icon: CheckSquare,
    items: [
      { title: "My Validation Request", href: "/validation", icon: Send },
      { title: "Validation Task", href: "/validation/tasks", icon: ClipboardList },
      { title: "Validation History", href: "/validation/history", icon: History },
    ],
  },
  {
    title: "Assessment",
    icon: FileQuestion,
    items: [
      { title: "Start Assessment", href: "/assessment", icon: PlayCircle },
      { title: "Ongoing Assessment", href: "/assessment/ongoing", icon: Clock },
      { title: "Assessment Result", href: "/assessment/result", icon: Award },
      { title: "Assessment History", href: "/assessment/history", icon: History },
    ],
  },
  {
    title: "Certification",
    icon: Award,
    items: [
      { title: "Certification Request", href: "/certification", icon: FilePlus },
      { title: "My Certificate", href: "/certification/my-certificates", icon: FileBadge },
      { title: "Certification History", href: "/certification/history", icon: History },
    ],
  },
  {
    title: "Program Development",
    icon: Layers,
    items: [
      { title: "Program Journey", href: "/programs", icon: Map },
      { title: "Specialization", href: "/programs/specialization", icon: Target },
      { title: "Sub-specialization", href: "/programs/sub-specialization", icon: GitBranch },
      { title: "Add-On Program", href: "/programs/add-on", icon: PlusCircle },
    ],
  },
  {
    title: "Approval & Workflow",
    icon: CheckSquare,
    items: [
      { title: "Approval Inbox", href: "/approval", icon: Inbox },
      { title: "Approval History", href: "/approval/history", icon: History },
      { title: "Pending Request", href: "/approval/pending", icon: Clock },
    ],
  },
  {
    title: "Scheduling",
    icon: Calendar,
    items: [
      { title: "Assessment Schedule", href: "/scheduling", icon: CalendarCheck },
      { title: "Certification Schedule", href: "/scheduling/certification", icon: CalendarDays },
      { title: "Calendar View", href: "/scheduling/calendar", icon: Calendar },
    ],
  },
  {
    title: "Report & Analytics",
    icon: BarChart,
    items: [
      { title: "Skill Completion Report", href: "/reports", icon: FileBarChart },
      { title: "Assessment Report", href: "/reports/assessment", icon: FileText },
      { title: "Certification Report", href: "/reports/certification", icon: FileBadge },
      { title: "Dashboard Analytics", href: "/reports/analytics", icon: LineChart },
    ],
  },
  {
    title: "Notification Center",
    icon: Bell,
    items: [
      { title: "Inbox", href: "/notifications", icon: MailOpen },
      { title: "Announcement", href: "/notifications/announcements", icon: Megaphone },
    ],
  },
]

const EMPLOYEE_GENERAL = [
  { title: "Help", href: "/help", icon: HelpCircle },
  { title: "Conversion", href: "/conversion", icon: ArrowLeftRight },
  { title: "Promotion", href: "/promotion", icon: Trophy },
]

const ADMIN_MENUS = [
  {
    title: "Master Data",
    icon: Database,
    items: [
      { title: "Program", href: "/admin/programs", icon: Layers },
      { title: "Stage", href: "/admin/stages", icon: GitBranch },
      { title: "Skill", href: "/admin/skills", icon: BookOpen },
      { title: "Competency", href: "/admin/competency", icon: Target },
      { title: "Question Bank", href: "/admin/question-bank", icon: FileQuestion },
      { title: "Answer", href: "/admin/answers", icon: CheckSquare },
      { title: "Certificate Template", href: "/admin/certificate-templates", icon: Award },
      { title: "Approval Matrix", href: "/admin/approval-matrix", icon: GitMerge },
      { title: "Email Template", href: "/admin/email-templates", icon: Mail },
    ],
  },
  {
    title: "User & Access Management",
    icon: Users,
    items: [
      { title: "User Management", href: "/admin/users", icon: Users },
      { title: "Role & Permission", href: "/admin/roles", icon: Shield },
      { title: "Organization Structure", href: "/admin/org-structure", icon: Building },
    ],
  },
  {
    title: "System Configuration",
    icon: Settings,
    items: [
      { title: "Exam Monitoring", href: "/admin/monitoring", icon: Bell },
      { title: "General Config", href: "/admin/config", icon: Settings2 },
      { title: "Integration Config", href: "/admin/integrations", icon: Link2 },
      { title: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
    ],
  },
]

/* ─────────────── Component ─────────────── */

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "administrator"

  const menus = isAdmin ? ADMIN_MENUS : EMPLOYEE_MENUS

  const isActive = (href: string) => pathname === href
  const isGroupActive = (items: { href: string }[]) => items.some((i) => pathname.startsWith(i.href))

  return (
    <Sidebar collapsible="icon">
      {/* Header: Logo */}
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
            CAT
          </div>
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-semibold text-sm truncate">SAR System</span>
            <span className="text-xs text-muted-foreground truncate">Trakindo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* Main menus */}
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Administration" : "Main Menu"}</SidebarGroupLabel>
          <SidebarMenu>
            {menus.map((section) => (
              <Collapsible
                key={section.title}
                defaultOpen={isGroupActive(section.items)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={section.title}>
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.items.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.href)}>
                            <Link href={item.href}>
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* General items (employee only) */}
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarMenu>
              {EMPLOYEE_GENERAL.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: User info + logout */}
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col leading-tight overflow-hidden flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.name ?? "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
