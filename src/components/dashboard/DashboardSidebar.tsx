import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Car,
  Users,
  DollarSign,
  Settings,
  LogOut,
  CreditCard,
  List,
  ShieldCheck,
} from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

export function DashboardSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <SidebarHeader className="hidden md:flex">
        <div className="flex items-center justify-between">
          <Logo />
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {isAdmin ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard"
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/listings"
                  isActive={isActive("/dashboard/listings")}
                  tooltip="All Listings"
                >
                  <Car />
                  <span>All Listings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/dealers"
                  isActive={isActive("/dashboard/dealers")}
                  tooltip="Dealers"
                >
                  <Users />
                  <span>Dealers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/commissions"
                  isActive={isActive("/dashboard/commissions")}
                  tooltip="Commissions"
                >
                  <DollarSign />
                  <span>Commissions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/my-listings"
                  isActive={isActive("/dashboard/my-listings")}
                  tooltip="My Listings"
                >
                  <List />
                  <span>My Listings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/verification"
                  isActive={isActive("/dashboard/verification")}
                  tooltip="Verification"
                >
                  <ShieldCheck />
                  <span>Verification</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/subscription"
                  isActive={isActive("/dashboard/subscription")}
                  tooltip="Subscription"
                >
                  <CreditCard />
                  <span>Subscription</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarContent className="!flex-col-reverse mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/dashboard/settings"
              isActive={isActive("/dashboard/settings")}
              tooltip="Settings"
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}

    
